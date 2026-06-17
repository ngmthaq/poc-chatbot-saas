- Author: Root Agent
- Title: Plan (rev. 3) — Prisma 7 config + driver-adapter style, with multi-file schema layout
- Classification: feature
- Description: Upgrade to Prisma 7, move the connection URL into `prisma.config.ts`, connect via `@prisma/adapter-pg`, and organize the schema as a multi-file folder (`prisma/schema/`) so models can live in separate per-domain files.

> Supersedes: docs/17-06-2026-12-52-38-add-postgres-prisma-db-connection.md (Prisma 6 url-in-schema baseline, already implemented).

---

## Approach Summary

- Prisma 7 removes `datasource.url` from the schema. The CLI (migrate/generate/studio) reads the URL from a new `prisma.config.ts`; the runtime client connects via a driver adapter passed to `new PrismaClient({ adapter })`.
- Postgres adapter is `@prisma/adapter-pg` (backed by the `pg` driver) — standard for the self-hosted `postgres:16-alpine`.
- Replace the single `prisma/schema.prisma` with a `prisma/schema/` folder. `prisma/schema/schema.prisma` holds the `datasource` + `generator`; each domain's models will live in their own `prisma/schema/<domain>.prisma` file. `prisma.config.ts` points `schema` at the folder.
- No models exist yet, so the multi-file task delivers the folder structure + documented convention (a commented placeholder showing where per-domain model files go), not an actual model split.
- App-level `DATABASE_URL` Yup validation stays; `prisma.config.ts` reads the same env var (one source of truth).

## Functional Requirements

- `pnpm --filter server prisma:generate` succeeds with no `url`-deprecation error.
- Runtime `PrismaClient` connects through `@prisma/adapter-pg` using `DATABASE_URL`; `$connect`/`$disconnect` lifecycle and the `SELECT 1` health ping keep working unchanged.
- `prisma migrate` / `studio` resolve the DB URL from `prisma.config.ts`.
- Multi-file schema folder resolves correctly (datasource/generator in one file; ready for per-domain model files).
- `typecheck` and `lint` pass.

## Files in Scope

- apps/server/package.json — modify: Prisma -> `^7.8.0`; add `@prisma/adapter-pg` `^7.8.0` + `pg` `^8`; `@types/pg` devDep.
- apps/server/prisma/schema.prisma — delete (moves into the folder).
- apps/server/prisma/schema/schema.prisma — create: `datasource` (no `url`) + v7-correct generator.
- apps/server/prisma/schema/ placeholder (e.g. commented `models.prisma` or `.gitkeep`) — create: documents where per-domain model files go.
- apps/server/prisma.config.ts — create: `schema` -> `prisma/schema` folder; `datasource.url` from `DATABASE_URL`.
- apps/server/src/utils/prisma.utils.ts — modify: `PrismaPg` adapter + globalThis singleton; fix client import path.
- apps/server/.gitignore / apps/server/tsconfig.json — modify (only if needed): generated-client dir.

Unchanged: env.ts, .env.example, server.ts, health.service.ts, health.controller.ts, types/health.d.ts.

## Risks & Assumptions

- Risk (version-specific): exact v7.8.0 API (`prisma.config.ts` helper, generator `provider`/`output`, `PrismaPg` signature, multi-file folder path key) verified empirically by the developer via `prisma generate` + `typecheck`; deviations surfaced as blockers, not guessed around.
- Risk: v7 may generate the client to a custom output dir (not `@prisma/client`), changing the import in prisma.utils.ts and requiring .gitignore/tsconfig updates — covered in scope.
- Assumption: `@prisma/adapter-pg` + `pg` is the driver (vs. Accelerate). Major bump 6->7 accepted.
- Assumption: folder name `prisma/schema/` (Prisma's conventional multi-file location).

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute
- [x] Completed
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                     | Responsible Role | Dependencies | Skills       |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | DONE   | Bump Prisma to `^7.8.0`; add `@prisma/adapter-pg` + `pg` (+`@types/pg`) in `package.json`; install                                       | developer        | none         | `clean-code` |
| 2   | DONE   | Convert to multi-file schema: delete `prisma/schema.prisma`, create `prisma/schema/schema.prisma` (datasource sans `url` + v7 generator) | developer        | task 1       | `clean-code` |
| 3   | DONE   | Establish the per-domain model-file convention in `prisma/schema/` — documented placeholder file showing where future models go          | developer        | task 2       | `clean-code` |
| 4   | DONE   | Create `prisma.config.ts` (schema -> `prisma/schema` folder; `DATABASE_URL`)                                                             | developer        | task 1       | `clean-code` |
| 5   | DONE   | Rewire `prisma.utils.ts` to the `PrismaPg` adapter (globalThis singleton; fix client import path)                                        | developer        | task 1,2,4   | `clean-code` |
| 6   | DONE   | Update `.gitignore`/`tsconfig.json` if v7 generates outside `node_modules`; run `prisma generate`, `typecheck`, `lint` and report output | developer        | task 5       | `clean-code` |

## Execution Notes

- **Generator**: kept `prisma-client-js`. v7 generates it to the default `@prisma/client` location in `node_modules`, so the runtime import stays `import { PrismaClient } from '@prisma/client'` and no `.gitignore`/`tsconfig.json` changes were needed (the custom-output-dir risk did not materialize).
- **`PrismaPg` signature**: `new PrismaPg({ connectionString })` (constructor accepts `pg.Pool | pg.PoolConfig | string`). Driver adapters are GA in v7 — no `previewFeatures` flag required.
- **`prisma.config.ts` schema key**: `schema: path.join('prisma', 'schema')` points at the multi-file folder; Prisma recursively loads every `*.prisma` file in it.
- **DB URL in config**: used `process.env.DATABASE_URL` rather than the strict `env()` helper so `prisma generate` (no DB needed) never fails when the URL is unset; migrate/studio still need it. `prisma.config.ts` loads `.env.local` via dotenv to match the app. `DATABASE_URL` is still hard-validated at app boot by the Yup schema and by `loadEnv()` in `prisma.utils.ts`.
- **Verification**: `pnpm prisma:generate` ✔ (Prisma Client v7.8.0), `pnpm typecheck` ✔, `pnpm lint` ✔.
