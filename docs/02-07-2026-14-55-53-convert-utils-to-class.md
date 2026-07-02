- Author: Root Agent
- Title: Plan — Convert remaining util singletons/factory to classes with private members
- Classification: feature (refactor)
- Description: Convert the 3 non-class util files (`logger`, `prisma`, `response-handler`) into classes — module-level non-exported constants become `private readonly` fields, the prisma error-guards become public methods — each exporting a single shared singleton instance, then rewrite all ~40 consumer call sites to go through those instances.

---

## Approach Summary

- Each of the 3 files gets a PascalCase `*Util` class holding its former module-level guts as **`private readonly`** fields, plus a **single exported singleton instance** (`loggerUtil`, `prismaUtil`, `responseHandlerUtil`) so there is exactly one PrismaClient/pino instance (no extra connection pools, hot-reload caching preserved).
- Consumers are rewritten: `prisma.X` -> `prismaUtil.client.X`; `isUniqueViolation/isRecordNotFound(err)` -> `prismaUtil.isUniqueViolation/isRecordNotFound(err)`; `logger.X` -> `loggerUtil.instance.X`; `responseHandler(fn)` -> `responseHandlerUtil.handle(fn)`.
- The 7 already-class utils (`AdminTokenUtil`, `ApiKeyUtil`, `PasswordUtil`, 4x LiveKit) are compliant and left untouched.

## Functional Requirements

- `logger.utils.ts`, `prisma.utils.ts`, `response-handler.utils.ts` each export a class + one singleton instance; no standalone exported functions/consts remain.
- Former non-exported constants become `private readonly` fields (`config`/`level`; `DATABASE_URL`/`globalForPrisma`/`adapter`).
- Error guards become public methods on `PrismaUtil`.
- All consumer call sites compile and behave identically. `pnpm server typecheck`, `pnpm server lint`, `pnpm format` pass.

## Non-Functional Requirements

- **Exactly one PrismaClient instance** — `prismaUtil` is a module-level singleton and the `globalForPrisma` hot-reload caching is preserved verbatim. No `new PrismaClient()` anywhere else.
- **Exactly one pino instance** — `loggerUtil` singleton.
- No inline type declarations; reuse `SuccessResponseBody` from `../types/response-handler`, imported types from `pino`/`@prisma/client`.

## Class / file mapping

| File                      | Class                 | Exported singleton    | Public surface                                                                                                      |
| ------------------------- | --------------------- | --------------------- | ------------------------------------------------------------------------------------------------------------------- |
| logger.utils.ts           | `LoggerUtil`          | `loggerUtil`          | `instance` (pino `Logger`); private readonly `config`, `level`                                                      |
| prisma.utils.ts           | `PrismaUtil`          | `prismaUtil`          | `client` (PrismaClient), `isUniqueViolation()`, `isRecordNotFound()`; private readonly `adapter`, `globalForPrisma` |
| response-handler.utils.ts | `ResponseHandlerUtil` | `responseHandlerUtil` | `handle(fn)` -> RequestHandler                                                                                      |

## Files in Scope

- **Convert (3):** `utils/logger.utils.ts`, `utils/prisma.utils.ts`, `utils/response-handler.utils.ts`
- **Consumer updates (15):**
  - prisma client: `server.ts`, `services/api-key.service.ts`, `services/health.service.ts`, `services/admin-auth.service.ts`, `services/tenant.service.ts`
  - prisma guards: `services/tenant.service.ts` (same file)
  - logger: `server.ts`, `services/health.service.ts`, `services/webhook.service.ts`, `middlewares/api-key.middleware.ts`, `middlewares/rate-limit.middleware.ts`
  - responseHandler: `routes/{config,chat,webhook,livekit,admin-auth,tenant,health}.route.ts` (7)

## Risks & Assumptions

- **Assumption:** `responseHandlerUtil` follows the same shared-singleton style chosen for prisma/logger (cleaner than `new ResponseHandlerUtil()` at 13 sites). `handle` is a plain method (invoked immediately, no `this`-binding concern).
- **Assumption:** `LoggerUtil`/`PrismaUtil` initialize fields in declared order (or via constructor) so `level` sees `config` and `client` sees `adapter`.
- **Risk (guarded):** multiple PrismaClient pools if any call site instantiates its own — mitigated by the single exported `prismaUtil` and preserved `globalForPrisma` cache.
- JSDoc/prose mentions of "responseHandler" in controller comments are descriptive and will be left as-is (not call sites).

## Open Questions / Blockers

- None. (All resolved in brainstorming.)

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                           | Responsible Role | Dependencies | Skills       |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | ------------ |
| 1   | DONE   | Convert the 3 util files to classes (private readonly fields, guards as public methods, `handle` method) and export singletons `loggerUtil`/`prismaUtil`/`responseHandlerUtil` | developer        | none         | `clean-code` |
| 2   | DONE   | Rewrite all 15 consumer files to use the singletons (`prismaUtil.client`, `prismaUtil.isUniqueViolation`, `loggerUtil.instance`, `responseHandlerUtil.handle`)                 | developer        | task 1       | `clean-code` |
| 3   | DONE   | Run `pnpm server typecheck`, `pnpm server lint`, `pnpm format`; fix any fallout                                                                                                | developer        | tasks 1,2    | —            |
