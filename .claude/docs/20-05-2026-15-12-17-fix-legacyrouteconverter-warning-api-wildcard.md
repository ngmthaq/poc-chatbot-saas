- From: debugger (sub-agent loaded with the matching role skill)
- To: Root Agent
- Title: Plan Response — Eliminate `LegacyRouteConverter` warning for `/api/*` in backend-service
- Description: Override `nestjs-pino`'s default `forRoutes: [{ path: '*', method: ALL }]` by passing an explicit `forRoutes` using the new named-wildcard `path-to-regexp` v8 syntax, so NestJS never has to legacy-convert the route assembled from the global prefix.

---

## Approach Summary

- The warning is not produced by any `/api/*` literal in user code. It is produced by NestJS internals (`@nestjs/core@11.1.20` `RouteInfoPathExtractor` + `LegacyRouteConverter`) when it composes the global prefix `'api'` (set in `src/main.ts:50` via `app.setGlobalPrefix(apiPrefix)`) with the default `forRoutes` that `nestjs-pino@4.6.1` registers for its HTTP logger middleware. `node_modules/nestjs-pino/LoggerModule.js:30` declares `DEFAULT_ROUTES = [{ path: '*', method: RequestMethod.ALL }]`, and `LoggerModule.configure()` at line 85 calls `consumer.apply(...middlewares).forRoutes(...DEFAULT_ROUTES)`. The resulting effective route `/api/*` uses the deprecated unnamed wildcard, which `path-to-regexp@8.4.2` (used by Express v5/Nest v11) no longer supports. The warning is logged twice because the same route is converted on two distinct internal code paths during bootstrap (route registration and middleware exclusion pipeline both run `LegacyRouteConverter.tryConvert`).
- Fix: pass an explicit `forRoutes` option to `PinoLoggerModule.forRootAsync({...})` in `src/global/logger/logger.module.ts` using the new named-wildcard syntax (e.g. `{ path: '{*splat}', method: RequestMethod.ALL }` — matches what `LegacyRouteConverter` would have auto-converted to, and what the upstream nestjs-pino TODO comment recommends for NestJS 11). This keeps the logger attached to every HTTP route exactly as it is today (no behavior change for clients) while eliminating the legacy syntax that triggers the warning.
- Scope is intentionally minimal: only `logger.module.ts` changes. No edits to `main.ts`, no global prefix changes, no route changes anywhere else.

## Functional Requirements

- Bootstrap of `backend-service` produces zero `LegacyRouteConverter` warnings.
- The pino HTTP request logger continues to log every HTTP request handled by the app (no route is silently dropped from the logger middleware).
- All existing endpoints continue to resolve and respond identically: `GET /api/v1/`, `GET /api/v1/health`, and `POST /livekit/webhook` (note this last one is intentionally outside the `api` prefix per `LIVEKIT_WEBHOOK_ROUTE = 'livekit/webhook'`).

## Non-Functional Requirements

- No new runtime dependencies, no new packages.
- Change must be compatible with `@nestjs/core@11.1.20`, `@nestjs/platform-express@11`, `nestjs-pino@4.6.1`, and `path-to-regexp@8.4.2`.
- Maintain the existing module structure and Pino redact/customProps configuration verbatim — do not refactor unrelated code (per AGENT_RULES "DON'T make any changes that fall outside the scope of the user's request").
- Keep `clean-code` principles: single responsibility (only the logger module is touched), minimal diff, explicit constant naming for the wildcard route if extracted to a const.

## Files in Scope

- `/Users/nmthang6/Documents/Workspace/agent-assistant/backend-service/src/global/logger/logger.module.ts` — add an explicit `forRoutes` option to the `PinoLoggerModule.forRootAsync({...})` call. Import `RequestMethod` from `@nestjs/common`.

## Risks & Assumptions

- Assumption: `nestjs-pino@4.6.1`'s `forRoutes` option flows directly into NestJS's `MiddlewareConsumer.forRoutes(...)` (verified at `node_modules/nestjs-pino/LoggerModule.js:76-85`). Therefore overriding it with a v8-compatible pattern bypasses `LegacyRouteConverter` entirely.
- Assumption: the warning is the same single root cause emitted on two paths (route registration + exclude/match), not two distinct legacy routes. The user's source contains no `/api/*` literal, no `forRoutes('*')`, no `setGlobalPrefix(prefix, { exclude: [...] })`, no `useStaticAssets`, no `ServeStaticModule`, and no other `MiddlewareConsumer.configure(...)` calls — verified via project-wide grep. If after the fix any warning still appears, a second hidden source exists (e.g. inside a transitive module) and would need a separate investigation.
- Risk: choosing the wrong wildcard syntax. NestJS internal `LegacyRouteConverter` (see `node_modules/@nestjs/core/router/legacy-route-converter.js:37`) auto-rewrites `*` → `{*path}` and reuses `{*splat}` in some places. Both `'{*splat}'` and `'*splat'`-style named params are accepted by `path-to-regexp@8`. The upstream nestjs-pino TODO comment (`LoggerModule.js:26-28`) specifically suggests `/{*splat}`. Recommendation: use `'{*splat}'` (or `'*splat'`) consistently. The developer task includes a sub-step to confirm the chosen syntax produces no warning by booting the service.
- Risk: if any other downstream code relied on the legacy auto-conversion logging, that side-effect disappears (acceptable — it's a warning, not a behavior).
- Risk: project declares `Testing Workflow: Skip-Testing` in `.claude/PROJECT_OVERVIEW.md`, and the repo has no test runner installed (`jest`, `supertest`, `*.spec.ts`, test scripts in `package.json` — all absent). User resolved this by choosing the manual boot-log smoke check.
- Backward-compatibility: no route changes. The pino HTTP middleware still attaches to every URL since the named wildcard matches anything, just like the legacy `*` did.

## Open Questions / Blockers

- Resolved: testing approach → **manual boot-log smoke check** (Skip-Testing compatible).
- Resolved: wildcard form → **`{*splat}`**.

## Status

- [x] Ready to execute

## Task List

| #   | Status  | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Responsible Role | Dependencies | Skills             |
| --- | ------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------------ |
| 1   | TODO    | In `backend-service/src/global/logger/logger.module.ts`, add `RequestMethod` to the `@nestjs/common` import and pass `forRoutes: [{ path: '{*splat}', method: RequestMethod.ALL }]` as a top-level option (sibling of `imports`/`inject`/`useFactory`) to `PinoLoggerModule.forRootAsync({...})`. Do not change `useFactory`, `redact`, `customProps`, or any other existing config.                                                                                                                                                                                | developer        | none         | `clean-code`       |
| 2   | TODO    | Boot the service locally (`yarn start:dev` from `backend-service/`) and capture the first ~50 startup log lines. Assert that no log line contains the substring `LegacyRouteConverter` or `Unsupported route path`. Then issue a baseline request (`curl -sf http://localhost:3000/api/v1/`) and confirm it returns 200 and a pino HTTP log line is emitted for the request.                                                                                                                                          | tester           | task 1       | `testing-workflow` |
| 3   | SKIPPED | ALTERNATIVE jest+supertest e2e harness — user chose Skip-Testing-compatible manual smoke check.                                                                                                                                                                                                                                                                                                                                                                                                                       | tester           | n/a          | n/a                |
| 4   | TODO    | If after task 1 the warning still appears, do not modify scope further — report back to Root Agent with the captured log so a second-pass investigation can be planned.                                                                                                                                                                                                                                                                                                                                          | tester           | task 2       | `testing-workflow` |
