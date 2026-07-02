- Author: Root Agent
- Title: Plan — Convert all server middlewares to classes with private members
- Classification: feature (refactor)
- Description: Rewrite each file in `apps/server/src/middlewares/` as one class per middleware — module-level singletons and helper functions become `private readonly` fields / `private` methods, the handler becomes a public arrow-function `handle` property — then update `index.ts` and all call sites (app.ts + 4 route files) to instantiate the classes and pass `.handle`.

---

## Approach Summary

- Each exported handler becomes its own PascalCase `*Middleware` class in the same `*.middleware.ts` file. The runtime handler is exposed as a **public arrow-function property** `handle` (arrow, not a method, so `this` stays bound when Express receives `mw.handle`). Former non-exported helpers (`parseBearerToken`, `normaliseFiles`, `validateFiles`, `normalizeMessage`) become **`private` methods**; former module-level service singletons (`apiKeyService`, `adminAuthService`) become **`private readonly`** fields.
- Parameterized middlewares take their arguments via the **constructor** (`RequireScopesMiddleware(...scopes)`, `RequireBotBindingMiddleware(getBotId)`, `RequestValidatorMiddleware(options)`, `FileValidatorMiddleware(options)`); no-arg middlewares get a no-arg constructor.
- Call sites are updated to instantiate classes and pass `.handle`, mirroring the existing `new XController()`-at-module-top pattern.

## Functional Requirements

- Every middleware file exports a class; no standalone exported handler functions/consts remain.
- All non-exported functions/constants become `private` methods / `private readonly` fields on their class.
- `pnpm server typecheck`, `pnpm server lint`, and `pnpm format` all pass; runtime behavior of every route is unchanged.

## Non-Functional Requirements

- **Preserve rate-limit store semantics:** `authRateLimitHandler` is used on 3 admin-auth routes and `rateLimitHandler` globally — each wraps a single `express-rate-limit` store. The refactor must instantiate `AuthRateLimitMiddleware` **once** (reused across the 3 routes) so the shared counter is not fragmented into 3 independent stores (a behavior regression).
- `ErrorHandlerMiddleware.handle` must keep 4 parameters (Express detects error handlers by arity) and retain the `no-unused-vars` eslint-disable.
- No types/interfaces declared inline — reuse existing `src/types/*.d.ts` (`FileValidatorOptions`, `RequestValidatorOptions`, etc.).

## Class / file mapping

| File                              | New class(es)                                                                       | Constructor args | `handle` type       |
| --------------------------------- | ----------------------------------------------------------------------------------- | ---------------- | ------------------- |
| admin-auth.middleware.ts          | `AdminAuthMiddleware`                                                               | —                | RequestHandler      |
| api-key.middleware.ts             | `ApiKeyAuthMiddleware`                                                              | —                | RequestHandler      |
| error-handler.middleware.ts       | `ErrorHandlerMiddleware`                                                            | —                | ErrorRequestHandler |
| file-validator.middleware.ts      | `FileValidatorMiddleware`                                                           | `options`        | RequestHandler      |
| not-found.middleware.ts           | `NotFoundMiddleware`                                                                | —                | RequestHandler      |
| rate-limit.middleware.ts          | `GlobalRateLimitMiddleware`, `AuthRateLimitMiddleware`, `ApiKeyRateLimitMiddleware` | —                | RequestHandler      |
| request-validator.middleware.ts   | `RequestValidatorMiddleware`                                                        | `options`        | RequestHandler      |
| require-bot-binding.middleware.ts | `RequireBotBindingMiddleware`                                                       | `getBotId`       | RequestHandler      |
| require-scopes.middleware.ts      | `RequireScopesMiddleware`                                                           | `...required`    | RequestHandler      |

## Files in Scope

- **Rewrite (10):** all `apps/server/src/middlewares/*.middleware.ts` + `middlewares/index.ts` (re-export classes).
- **Call-site updates (5):** `apps/server/src/app.ts`, `routes/chat.route.ts`, `routes/admin-auth.route.ts`, `routes/tenant.route.ts`, `routes/livekit.route.ts`.

## Risks & Assumptions

- **Assumption:** parameterized middlewares receive args via constructor and expose `handle` as an arrow property (only shape consistent with the "`new X().handle`" choice). `handle` is an arrow property (not a method) for `this`-binding safety.
- **Assumption:** `file-validator`'s `multerHandler` is built in the constructor body (after `options` is set) to avoid field-initializer ordering issues.
- **Risk:** the rate-limiter shared-store issue above — explicitly guarded by instantiating `AuthRateLimitMiddleware` once in `admin-auth.route.ts`.
- **Assumption:** class names as tabled above.

## Open Questions / Blockers

- None. (All design decisions resolved in brainstorming.)

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                  | Responsible Role | Dependencies | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | DONE   | Rewrite all 10 middleware files as classes (private readonly fields, private methods, public arrow `handle`; constructor args per mapping table) and update `middlewares/index.ts` to export the classes              | developer        | none         | `clean-code` |
| 2   | DONE   | Update call sites (`app.ts`, `chat.route.ts`, `admin-auth.route.ts`, `tenant.route.ts`, `livekit.route.ts`) to instantiate classes and pass `.handle`; instantiate `AuthRateLimitMiddleware` once in admin-auth.route | developer        | task 1       | `clean-code` |
| 3   | DONE   | Run `pnpm server typecheck`, `pnpm server lint`, `pnpm format`; fix any fallout                                                                                                                                       | developer        | tasks 1,2    | —            |
