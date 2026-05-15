# backend-service

NestJS backend scaffold with batteries included: Prisma (MySQL), Redis cache + queue (BullMQ), JWT auth, role guards, throttling, structured logging (pino), Socket.IO with Redis adapter, file uploads (local/S3), and Swagger.

## Prerequisites

- Node.js >= 20
- Yarn (Classic or Berry)
- MySQL 8+ (reachable via `DATABASE_URL`)
- Redis 6+ (reachable via `REDIS_HOST`/`REDIS_PORT`)

## Setup

1. Install dependencies:
   ```bash
   yarn install
   ```
2. Copy environment template and fill in values:
   ```bash
   cp .env.example .env
   ```
   Required keys include `DATABASE_URL`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, and `ENCRYPTION_KEY` (must be 64 hex chars = 32 bytes for AES-256-GCM).
3. Generate the Prisma client:
   ```bash
   yarn prisma generate
   ```
4. Apply migrations against your database (development):
   ```bash
   yarn prisma migrate dev
   ```

## Docker

Self-contained Docker Compose stack with the API, a private Redis (cache + BullMQ broker), and a private MariaDB (Prisma datasource). Only the API port is published; Redis and MariaDB are reachable only on the internal compose network. The Redis instance in this stack is independent of the one in `livekit-server/` (different project, different volume).

### Prerequisites

- Docker Engine `>= 24` with the Compose v2 plugin (`docker compose`, not the legacy `docker-compose`).
- `openssl` available on the host (used by `scripts/bootstrap.sh`).
- Linux or macOS host. Windows is out of scope.

### Quickstart

```bash
cd backend-service
bash scripts/bootstrap.sh
docker compose up -d
```

`bootstrap.sh` generates `.env` (mode 600) with strong random secrets and sensible defaults; `docker compose up -d` builds the image, starts MariaDB and Redis first, then the backend once both report healthy. Prisma migrations are applied at container start via `scripts/entrypoint.sh`.

### Commands

| Action                | Command                                                       |
| --------------------- | ------------------------------------------------------------- |
| Start (detached)      | `docker compose up -d`                                        |
| Stop                  | `docker compose down`                                         |
| Logs (live)           | `docker compose logs -f`                                      |
| Logs (backend only)   | `docker compose logs -f backend`                              |
| Restart               | `docker compose restart`                                      |
| Status                | `docker compose ps`                                           |
| Regenerate secrets    | `bash scripts/bootstrap.sh --force && docker compose up -d`   |
| Validate compose file | `docker compose config`                                       |

`bootstrap.sh --force` writes a timestamped backup (`.env.bak.<ts>`) of the previous file before rotating, so credential rotations are recoverable for at least one cycle.

### Ports

| Port      | Proto | Service / Purpose                                | Public firewall |
| --------- | ----- | ------------------------------------------------ | --------------- |
| `${PORT}` | TCP   | NestJS API (defaults to `3000` via bootstrap)    | Yes (via TLS proxy) |
| 3306      | TCP   | MariaDB — internal compose network only          | **No**          |
| 6379      | TCP   | Redis — internal compose network only            | **No**          |

Public firewall rules should allow only the API port. MariaDB and Redis must never be reachable from outside the host.

### Migrations

`prisma migrate deploy` runs at container start via `scripts/entrypoint.sh` before the NestJS process binds the port — the container crash-loops if the schema is unreachable instead of serving 500s. For HA blue/green deployments, run migrations once from CI and set `RUN_MIGRATIONS=0` in the backend environment so replicas do not race for the migrations advisory lock.

### Environment variables

`prisma.config.ts` imports `dotenv/config`, but no `.env` file is shipped into the container — it is excluded by `.dockerignore` so secrets stay on the host. Inside the container, env values come from compose's `env_file:` directive, which loads `.env` into `process.env` at container start. So `dotenv/config` is a no-op in the container (no file to read) and the runtime reads variables straight from `process.env`.

### Security hardening checklist

- [ ] `.env` exists with mode `600` and is **never** committed (covered by `.gitignore`).
- [ ] Secrets rotated via `bash scripts/bootstrap.sh --force` on a regular cadence and after any suspected compromise.
- [ ] Cloud firewall restricts inbound traffic to only the API port; MariaDB (3306) and Redis (6379) are closed externally.
- [ ] The API port is fronted by a TLS-terminating reverse proxy (Caddy/Nginx) for any deployment that accepts traffic from the open internet.
- [ ] Runtime container runs as the non-root `node` user (uid 1000) — verified by `docker exec backend id -u`.
- [ ] `tini` is PID 1 inside the backend container so SIGTERM is forwarded cleanly during `docker compose down`.
- [ ] `docker compose logs` is collected by host logging (journald, CloudWatch, etc.) so failures are observable.
- [ ] No `:latest` image tags — `node`, `mariadb`, and `redis` are pinned (see below).

### Versions / Assumptions

- Node base image: `node:20-alpine` (latest 20.x LTS on Alpine; bump deliberately).
- MariaDB image: `mariadb:11.4` (pinned LTS major).
- Redis image: `redis:7-alpine` (pinned major; alpine for small footprint).
- Prisma 7 with `@prisma/adapter-mariadb` runs on the Alpine Node base; if a glibc-only native binding surfaces, fall back to `node:20-bookworm-slim` and update the Dockerfile base.
- Backend healthcheck uses busybox `wget --spider` against the API port; no extra apk packages are required.

## Scripts

| Script | Description |
|---|---|
| `yarn start:dev` | Run the app in watch mode. |
| `yarn build` | Compile to `dist/`. |
| `yarn start:prod` | Run the compiled app (`node dist/main`). |
| `yarn test` | Run unit tests with Jest. |
| `yarn test:e2e` | Run end-to-end tests. |
| `yarn lint` | Run ESLint (with `--fix`). |
| `yarn prisma generate` | Regenerate the Prisma client after schema changes. |
| `yarn prisma migrate dev` | Create + apply a new dev migration. |

## Folder Structure

```
backend-service/
  prisma/
    schema.prisma           # Prisma schema (MySQL)
  src/
    app.module.ts           # Root module wiring GlobalModule + APP_* providers
    app.controller.ts       # Smoke-test controller (default from `nest new`)
    app.service.ts          # Smoke-test service
    main.ts                 # Bootstrap: helmet, cors, versioning, swagger, ws
    redis-io.adapter.ts     # Socket.IO Redis adapter
    global/                 # Cross-cutting modules (each @Global where needed)
      config/               # @nestjs/config + Joi validation
      logger/               # nestjs-pino logger
      database/             # PrismaService + PrismaModule (@Global)
      cache/                # cache-manager with Redis store
      queue/                # BullMQ root config
      schedule/             # @nestjs/schedule
      event/                # @nestjs/event-emitter
      http/                 # @nestjs/axios
      crypto/               # AES-256-GCM helpers
      hash/                 # bcrypt helpers
      auth/                 # JWT service + JwtAuthGuard + RolesGuard
      upload/               # MulterModule with local/s3 strategies
      throttler/            # Rate limiting
      global.module.ts      # Aggregates and re-exports all global modules
    shared/                 # Stateless utilities (DTOs, decorators, etc.)
      constants/
      helpers/
      dto/
      interfaces/
      decorators/
      filters/
      interceptors/
      guards/               # Re-exports from global/auth
      pipes/
    modules/                # Feature modules go here
```

## API Surface

- Default route prefix: value of `API_PREFIX` (defaults to `api`).
- URI versioning is enabled with default version `1` (e.g., `/api/v1/...`).
- Swagger UI is mounted at the path defined in `SWAGGER_PATH` (defaults to `docs`) — open `http://localhost:<PORT>/docs` after starting the app. Use the "Authorize" button to attach a Bearer JWT (auth state is persisted thanks to `persistAuthorization`).

## Notes

- The global `JwtAuthGuard` enforces authentication on every route. Use the `@Public()` decorator on controllers/handlers that must be reachable without a token.
- Use `@Roles('admin', ...)` together with `RolesGuard` (already wired via `AuthModule`) to enforce RBAC on protected handlers.
- The `ENCRYPTION_KEY` is validated at boot via Joi and again inside `CryptoService` — the app will fail fast if the key is missing or malformed.
