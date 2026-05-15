# Plan: Initialize `backend-service` NestJS Scaffold with Full Library Stack

**Status:** `Ready`
**Approved:** 2026-05-14 12:47:27 (by user)

## Summary
Scaffold a new NestJS v10+ application at `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/` using `nest new` + Yarn, then wire up the full library stack (config, Prisma+MySQL, Redis cache, BullMQ, JWT auth, Multer/S3 upload, Swagger, WebSockets, throttler, helmet, etc.) organised into `global/`, `modules/`, and `shared/` folders. Each global concern is its own Nest module re-exported through a single `@Global()` barrel module so providers are app-wide.

## Resolved Decisions

| Decision | Value |
|---|---|
| Package manager | `yarn` |
| Init method | `nest new` via `@nestjs/cli` (`--skip-git`, `--strict`, `--package-manager yarn`) |
| Database / ORM | MySQL + Prisma |
| Auth strategy | JWT only (no Passport) — `@nestjs/jwt` + custom `JwtAuthGuard`, `RolesGuard` |
| Cache | `cache-manager` + `cache-manager-ioredis-yet` (Redis) |
| Queue | `@nestjs/bullmq` + `bullmq` (Redis) |
| WebSocket adapter | `@nestjs/websockets` + `@nestjs/platform-socket.io` + `@socket.io/redis-adapter` |
| Logger | `nestjs-pino` + `pino-pretty` (dev only) |
| File upload | Multer with both `multer` (disk) AND `multer-s3` + `@aws-sdk/client-s3` — strategy selected via env `FILE_STORAGE_DRIVER=local\|s3` |
| Crypto | Node `crypto` (AES-256-GCM) for encryption + `bcrypt` for password hashing |
| API versioning | URI versioning (`VersioningType.URI`) — default version `1` |
| Validation | `class-validator` + `class-transformer` + global `ValidationPipe` |
| Serialization | `ClassSerializerInterceptor` + `class-transformer` |
| Config | `@nestjs/config` with Joi schema validation |
| Task scheduling | `@nestjs/schedule` |
| Events | `@nestjs/event-emitter` |
| HTTP module | `@nestjs/axios` + `axios` |
| Compression | `compression` middleware |
| Cookies | `cookie-parser` |
| Security | `helmet`, `@nestjs/throttler` (rate limit), `cors` (built-in Nest enableCors) |
| Swagger | `@nestjs/swagger` + `swagger-ui-express` — mount at `/docs` |
| SSE | NestJS built-in `Sse()` decorator + `rxjs` Observable |
| Streaming files | NestJS `StreamableFile` |

## Folder Structure

```
backend-service/
├── prisma/schema.prisma
├── src/
│   ├── global/
│   │   ├── config/        ├── database/    ├── cache/      ├── logger/
│   │   ├── queue/         ├── event/       ├── schedule/   ├── http/
│   │   ├── crypto/        ├── hash/        ├── auth/       ├── upload/
│   │   ├── throttler/     └── global.module.ts (@Global())
│   ├── modules/.gitkeep
│   ├── shared/
│   │   ├── constants/  helpers/  decorators/  filters/
│   │   ├── interceptors/  pipes/  guards/  dto/  interfaces/
│   ├── app.module.ts
│   ├── main.ts
│   └── redis-io.adapter.ts
├── test/app.e2e-spec.ts
├── .env.example   .gitignore   .prettierrc   .eslintrc.js
├── nest-cli.json  tsconfig.json  tsconfig.build.json
├── package.json   yarn.lock
└── README.md
```

## Tasks

| # | Task | File(s) | Responsible Role | Acceptance Criteria | Depends On |
|---|---|---|---|---|---|
| 1 | Generate base NestJS project: `nest new backend-service --package-manager yarn --strict --skip-git` | entire `backend-service/` tree | developer | `yarn build` produces `dist/`; default `app.controller.spec.ts` passes | — |
| 2 | Install full runtime + dev dependency set in one Yarn add (see Resolved Decisions for the complete list) | `package.json`, `yarn.lock` | developer | `yarn install` exits 0; all deps present | 1 |
| 3 | Create `.env.example` (keys only) + complete `.gitignore` | `.env.example`, `.gitignore` | developer | Secret-scanner finds zero hardcoded values; `.env`, `dist/`, `node_modules/`, `coverage/`, `*.log` ignored | 1 |
| 4 | Create `shared/constants/` (app, cache, queue, event) + barrel | `src/shared/constants/*.ts` | developer | Build succeeds; constants exported via `index.ts` | 1 |
| 5 | Create `shared/helpers/` (pure helpers — no Nest imports) | `src/shared/helpers/*.ts` | developer | `grep "@Injectable" src/shared/helpers` → 0 matches | 1 |
| 6 | Create shared DTOs (`pagination.dto.ts`, `id-param.dto.ts`) + interfaces (`JwtPayload`, `PaginatedResult`, `AuthenticatedRequest`) | `src/shared/dto/*`, `src/shared/interfaces/*` | developer | All DTOs validated; build succeeds | 2 |
| 7 | Create shared filters / interceptors / decorators / pipes (`HttpExceptionFilter`, `LoggingInterceptor`, `TimeoutInterceptor`, `TransformInterceptor`, `@CurrentUser`, `@Public`, `@Roles`, `@ApiVersion`) | `src/shared/{filters,interceptors,decorators,pipes}/*` | developer | Global filter outputs `{statusCode,message,path,timestamp,requestId}` | 4 |
| 8 | `global/config/` — `@nestjs/config` + Joi validation schema covering every key in `.env.example` | `src/global/config/*` | developer | Invalid env throws Joi error at boot | 3, 4 |
| 9 | `yarn prisma init --datasource-provider mysql`; author `prisma/schema.prisma` with minimal `User` model | `prisma/schema.prisma` | developer | `yarn prisma generate` succeeds; `yarn prisma format` clean | 2 |
| 10 | `global/database/` — `PrismaService extends PrismaClient implements OnModuleInit/OnModuleDestroy`; `@Global()` module | `src/global/database/*` | developer | Build succeeds; module annotated `@Global()` | 8, 9 |
| 11 | `global/logger/` — `nestjs-pino` `LoggerModule.forRootAsync`; pretty transport gated on `NODE_ENV !== 'production'`; redact `authorization`, `cookie`, `password`, `*.token` | `src/global/logger/*` | developer | JSON logs in prod, pretty in dev; `redact` array present | 8 |
| 12 | `global/cache/` — `@nestjs/cache-manager` v2 + `cache-manager-ioredis-yet`; factory reads Redis cfg from `ConfigService` | `src/global/cache/*` | developer | Build succeeds; Redis store factory used | 8 |
| 13 | `global/queue/` — BullMQ root `BullModule.forRootAsync`; helper `registerQueue(name)` | `src/global/queue/*` | developer | Build succeeds; uses `ConfigService` (no hardcoded host) | 8 |
| 14 | `global/schedule/` — `ScheduleModule.forRoot()` | `src/global/schedule/*` | developer | Build succeeds | 1 |
| 15 | `global/event/` — `EventEmitterModule.forRoot({wildcard:true, maxListeners:20})` | `src/global/event/*` | developer | Build succeeds | 1 |
| 16 | `global/http/` — `@nestjs/axios` `HttpModule.registerAsync` with timeout/maxRedirects from config | `src/global/http/*` | developer | Build succeeds | 8 |
| 17 | `global/crypto/` — AES-256-GCM `encrypt/decrypt`; key length validated | `src/global/crypto/*` | developer | Throws on invalid key length; build succeeds | 8 |
| 18 | `global/hash/` — bcrypt wrapper; salt rounds from config | `src/global/hash/*` | developer | `hash`/`compare` exposed; build succeeds | 8 |
| 19 | `global/auth/` — JWT only (no Passport): `JwtModule.registerAsync`, `JwtService` wrapper, `JwtAuthGuard` (honours `@Public`), `RolesGuard` (honours `@Roles`). Re-export from `shared/guards` | `src/global/auth/*`, `src/shared/guards/index.ts` | developer | Build succeeds; `@Public()` bypasses guard | 8, 7 |
| 20 | `global/upload/` — Multer strategy: `local.strategy.ts` (`diskStorage`) + `s3.strategy.ts` (`multerS3` + `S3Client`); driver selected by `FILE_STORAGE_DRIVER` | `src/global/upload/*` | developer | Switching env selects strategy; invalid value throws | 8 |
| 21 | `global/throttler/` — `ThrottlerModule.forRootAsync` w/ TTL+limit from config | `src/global/throttler/*` | developer | Build succeeds | 8 |
| 22 | `global/global.module.ts` (`@Global()`) — barrel importing AND re-exporting modules 8–21 | `src/global/global.module.ts`, `src/global/index.ts` | developer | `exports` equals `imports`; build succeeds | 8–21 |
| 23 | `src/modules/.gitkeep` placeholder | `src/modules/.gitkeep` | developer | File exists; build still succeeds | 1 |
| 24 | `app.module.ts` — register `APP_GUARD=ThrottlerGuard`, `APP_GUARD=JwtAuthGuard`, `APP_FILTER=HttpExceptionFilter`, `APP_INTERCEPTOR=ClassSerializerInterceptor`, `APP_INTERCEPTOR=LoggingInterceptor`, `APP_PIPE=ValidationPipe({whitelist:true,transform:true,forbidNonWhitelisted:true})` | `src/app.module.ts` | developer | All 5 globals registered; build succeeds | 22, 7 |
| 25 | `main.ts` + `redis-io.adapter.ts` — wire helmet, compression, cookie-parser, cors, URI versioning v1, Swagger `/docs` with bearer auth, pino logger, Redis WebSocket adapter, shutdown hooks | `src/main.ts`, `src/redis-io.adapter.ts` | developer | App boots; `/docs` serves Swagger; helmet/compression/cors headers present | 24, 12 |
| 26 | `README.md` — prerequisites, env setup, scripts, folder structure, Swagger URL | `README.md` | developer | All mentioned scripts exist in `package.json` | 25 |
| 27 | Smoke e2e test (AAA pattern; mocks external Redis/MySQL) — `AppModule` compiles, `app.init()` succeeds, Swagger doc builds | `test/app.e2e-spec.ts` | tester | `yarn test:e2e` exits 0 | 25 |
| 28 | Final verification gate: `yarn lint && yarn build && yarn test && yarn test:e2e` | n/a | tester | All four exit 0; `dist/main.js` exists | 26, 27 |

## Risks
- Redis/MySQL unavailable during scaffold testing — task 27 mocks external connections; `yarn build` is the primary gate for tasks 1–26.
- `cache-manager` v5 vs v6 breaking changes — pin `cache-manager@^5` and `@nestjs/cache-manager@^2`.
- AES-256-GCM key length — validated both in Joi schema (task 8) AND `CryptoService` constructor (task 17).
- Global `JwtAuthGuard` locks all routes by default — `@Public()` must be honoured via `Reflector`; Swagger mounted on Express adapter (not a Nest route), so guard does not block `/docs`.
- `nest new` defaults to `git init` — passing `--skip-git` honours the constraint that parent workspace is not a git repo.
- Strict mode + `request.user` — typed via `AuthenticatedRequest` interface in `shared/interfaces`.

## Assumptions
- Node 20 LTS + Yarn available locally; NestJS CLI invoked via `npx @nestjs/cli` or globally installed.
- MySQL/Redis out-of-scope to provision — supplied by user via `.env`.
- "JWT only (no Passport)" = custom guards reading `Authorization: Bearer` directly via `JwtService.verifyAsync`; refresh tokens stateless at scaffold time.
- Global `JwtAuthGuard` registered via `APP_GUARD`; opt-out via `@Public()`.
- `CORS_ORIGINS` is comma-separated; `API_PREFIX` default `api` → effective routes `/api/v1/...`.
- One Prisma `User` model exists only to verify `prisma generate`; no real migration during scaffold.
- e2e smoke test mocks external connections — no live Redis/MySQL needed.

## Out of Scope
- Any business module under `src/modules/` (only `.gitkeep` is created).
- Real Prisma migrations beyond the example `User` model.
- Docker, CI/CD, deployment, monitoring/observability beyond pino logs.
- Passport.js (explicitly excluded), GraphQL, i18n.
- Production upload hardening (virus scan, signed URLs).
