- From: debugger (sub-agent loaded with the matching role skill)
- To: Root Agent
- Title: Plan Response (re-plan) — Eliminate `LegacyRouteConverter` warning for `/api/*` in backend-service
- Description: Fresh plan correcting the prior placement error — `forRoutes` must be returned from `useFactory` (on `Params`), not passed as a top-level option on `LoggerModuleAsyncParams`.

---

## Approach Summary

- The warning is emitted by NestJS internals (`@nestjs/core@11.1.20` `LegacyRouteConverter`) when it composes the global prefix `'api'` (set in `src/main.ts` via `app.setGlobalPrefix(apiPrefix)`) with `nestjs-pino`'s default `forRoutes: [{ path: '*', method: RequestMethod.ALL }]` (see `node_modules/nestjs-pino/LoggerModule.js` `DEFAULT_ROUTES`). Effective route `/api/*` uses the deprecated unnamed wildcard, which `path-to-regexp@8` no longer accepts; the same conversion runs on two internal code paths during bootstrap, producing two identical warnings.
- Fix: override the default `forRoutes` with the path-to-regexp v8 named-wildcard form `'{*splat}'`. **Critical placement correction:** `forRoutes` is declared on the `Params` interface (`node_modules/nestjs-pino/params.d.ts` line 34), which is the object **returned by `useFactory`**. It must be a **sibling of `pinoHttp` inside the object literal returned by the `useFactory` arrow function** — *not* a top-level key on the `forRootAsync({...})` argument. `LoggerModuleAsyncParams` (line 56-59) only declares `imports | providers | useFactory | inject`, which is why the previous attempt failed typecheck with `TS2353`.
- Scope remains a single file (`logger.module.ts`); manual boot-log smoke check (Skip-Testing-compatible) remains the verification mechanism.

## Functional Requirements

- Bootstrap of `backend-service` produces zero log lines containing `LegacyRouteConverter` or `Unsupported route path`.
- The pino HTTP request logger continues to log every HTTP request handled by the app (no route silently dropped from middleware).
- All existing endpoints continue to resolve and respond identically: `GET /api/v1/`, `GET /api/v1/health`, and `POST /livekit/webhook`.
- The TypeScript project still typechecks: `npx tsc --noEmit -p tsconfig.json` from `backend-service/` exits with status code 0.

## Non-Functional Requirements

- No new runtime dependencies, no new packages.
- Compatibility maintained with `@nestjs/core@11.1.20`, `@nestjs/platform-express@11`, `nestjs-pino@4.6.1`, `path-to-regexp@8.4.2`.
- Preserve existing module structure and verbatim Pino `redact` / `customProps` configuration — do not refactor unrelated code (AGENT_RULES: "DON'T make any changes that fall outside the scope of the user's request").
- Clean-code: single responsibility (only logger module touched), minimal diff, named constant optional but not required for a single literal.

## Files in Scope

- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/logger/logger.module.ts` — (a) add `RequestMethod` to the `@nestjs/common` import; (b) inside the object **returned by** `useFactory`, add `forRoutes: [{ path: '{*splat}', method: RequestMethod.ALL }]` as a sibling of `pinoHttp`.

## Risks & Assumptions

- Verified against installed types (`node_modules/nestjs-pino/params.d.ts`): `forRoutes` lives on `Params`, not `LoggerModuleAsyncParams` (line 34). `Params` allows `pinoHttp` and `forRoutes` to coexist.
- Wildcard form `'{*splat}'` re-confirmed (path-to-regexp v8 / NestJS 11 idiom).
- Risk: transitive module might re-introduce a legacy `*` `forRoutes` (none found in user code); tester task 5 catches this without expanding scope.
- Backward-compatibility: no route or behavior change. Pino middleware still attaches to every URL.

## Open Questions / Blockers

- Resolved: testing approach → manual boot-log smoke check.
- Resolved: wildcard form → `'{*splat}'`.
- Resolved: placement → inside `useFactory` return, sibling of `pinoHttp`.

## Status

- [x] Ready to execute

## Task List

| #   | Status  | Task | Responsible Role | Dependencies | Skills |
| --- | ------- | ---- | ---------------- | ------------ | ------ |
| 1   | TODO    | In `backend-service/src/global/logger/logger.module.ts`: (a) add `RequestMethod` to the `@nestjs/common` import; (b) inside the object literal returned by `useFactory`, add `forRoutes: [{ path: '{*splat}', method: RequestMethod.ALL }]` as a sibling of `pinoHttp`. Leave other config byte-identical. | developer | none | `clean-code` |
| 2   | TODO    | From `backend-service/`, run `npx tsc --noEmit -p tsconfig.json` and confirm exit code 0. | developer | task 1 | `clean-code` |
| 3   | TODO    | From `backend-service/`, run `yarn start:dev`, capture first ~50 startup lines, assert no `LegacyRouteConverter` / `Unsupported route path`, then `curl -sf http://localhost:3000/api/v1/` and confirm 200 + pino HTTP log line. | tester | task 2 | `testing-workflow` |
| 4   | SKIPPED | jest+supertest e2e harness alternative. User chose Skip-Testing-compatible manual smoke check. | tester | n/a | n/a |
| 5   | TODO    | If typecheck or warning checks fail, report back to Root Agent with exact compiler output and/or boot logs. Do not expand scope. | tester | task 3 | `testing-workflow` |
