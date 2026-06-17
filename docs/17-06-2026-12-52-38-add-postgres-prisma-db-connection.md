- Author: Root Agent
- Title: Plan — Add PostgreSQL + Prisma database connection layer to the `server` app
- Classification: feature
- Description: Introduce a Prisma-managed PostgreSQL connection layer in the Express `server` app — schema file, generated client singleton, Yup-validated `DATABASE_URL`, startup/shutdown lifecycle, and a DB health ping — reusing the existing `postgres:16-alpine` container from `infra`.

---

## Approach Summary

- The `infra` stack already provisions PostgreSQL (apps/infra/docker-compose.yml:103) with `callcenter_dev` / `callcenter_user`; nothing connects to it yet. We add the client side only.
- Follow the server's existing layered conventions: env validated in configs/env.ts, a stateless singleton in `utils/`, lifecycle wired in server.ts, and DB liveness folded into the existing health service.
- Prisma uses the migrate workflow (versioned SQL migrations). Since scope is connection plumbing only (no domain models), we set up the migrate tooling/scripts now; the first actual migration is deferred to when the first model is added (an empty schema has nothing to migrate).
- Skip-Testing honored — developer sub-agent only, no tester.

## Functional Requirements

- `pnpm server dev` / `start` connects to PostgreSQL on boot and logs success via the Pino logger; a connection failure surfaces an error (no silent failure).
- Process shutdown (SIGINT/SIGTERM) cleanly calls `prisma.$disconnect()`.
- A single shared `PrismaClient` instance is exported from `utils/` and reused across the app (no ad-hoc instantiation), surviving `tsx watch` reloads without leaking connections.
- `GET /health` returns DB liveness (e.g. `{ status: 'ok', db: 'ok' }`) by running a lightweight `SELECT 1`.
- `DATABASE_URL` is required and validated at startup via the Yup schema; missing/invalid value throws on boot.
- `prisma generate` runs as part of build/install so `@prisma/client` types resolve under `tsc`.

## Non-Functional Requirements

- Respect TypeScript strictness (`verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`) and Prettier rules.
- Any new `type`/`interface` declared in `src/types/*.d.ts` per project convention, never inline.
- No secret values committed — `.env.example` gets a local-dev placeholder consistent with the existing `devkey`/`devsecret` pattern.
- Use the Pino logger (`utils/logger.utils.ts`), never `console.log`.

## Files in Scope

- apps/server/package.json — modify: add `@prisma/client` dep, `prisma` devDep; add `db:migrate` / `prisma:generate` scripts; run `prisma generate` in `build` + `postinstall`.
- apps/server/prisma/schema.prisma — create: `postgresql` datasource (`env("DATABASE_URL")`) + client generator; no models yet (placeholder comment).
- apps/server/src/configs/env.ts — modify: add `DATABASE_URL` (required, trimmed) to the Yup schema.
- apps/server/.env.example — modify: add a documented `DATABASE_URL` local-dev example.
- apps/server/src/utils/prisma.utils.ts — create: `PrismaClient` singleton (globalThis-cached for watch mode).
- apps/server/src/server.ts — modify: `await prisma.$connect()` on startup; graceful `$disconnect()` on SIGINT/SIGTERM.
- apps/server/src/services/health.service.ts — modify: async `getStatus()` adding a `SELECT 1` DB ping.
- apps/server/src/controllers/health.controller.ts — modify: `await` the now-async service call.
- apps/server/src/types/health.d.ts — create (if needed): health-status response shape.

## Risks & Assumptions

- Assumption: target DB is the existing `infra` PostgreSQL (`postgresql://callcenter_user:callcenter_password@localhost:5432/callcenter_dev?schema=public`). Developer adds this to `.env.example`; user must set `DATABASE_URL` in `apps/server/.env.local` (agent rules forbid the Root Agent reading/writing env values).
- Risk: `prisma generate` must succeed for `tsc` to typecheck — wired into `build`/`postinstall` to avoid a broken build.
- Risk: generating an actual migration requires the postgres container running. With no models there's nothing to migrate, so no migration is run in this task — tooling only.
- Assumption: newer Prisma is acceptable; standard `prisma-client-js` generator with default `@prisma/client` output (ESM-compatible).

## Open Questions / Blockers

- None — all resolved in brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                      | Responsible Role | Dependencies | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Add Prisma deps (`@prisma/client`, `prisma`) + `prisma:generate`/`db:migrate` scripts to `package.json`; run `prisma generate` in `build` + `postinstall` | developer        | none         | `clean-code` |
| 2   | TODO   | Create `prisma/schema.prisma` — postgres datasource via `env("DATABASE_URL")` + client generator, no models                                               | developer        | task 1       | `clean-code` |
| 3   | TODO   | Add required `DATABASE_URL` to Yup schema in `configs/env.ts`; add documented example to `.env.example`                                                   | developer        | none         | `clean-code` |
| 4   | TODO   | Create `utils/prisma.utils.ts` — globalThis-cached `PrismaClient` singleton                                                                               | developer        | task 1, 2    | `clean-code` |
| 5   | TODO   | Wire `$connect()` on startup + graceful `$disconnect()` on SIGINT/SIGTERM in `server.ts` (Pino-logged)                                                    | developer        | task 4       | `clean-code` |
| 6   | TODO   | Add `SELECT 1` DB ping to `health.service.ts` (async) + `await` in `health.controller.ts`; add `types/health.d.ts` if a type is needed                    | developer        | task 4       | `clean-code` |
