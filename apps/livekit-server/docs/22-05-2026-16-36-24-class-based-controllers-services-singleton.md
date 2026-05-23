# Plan — Class-based Controllers + Services with Singleton Export

- From: planner (sub-agent loaded with the planner role skill)
- To: Root Agent
- Title: Plan Response — Class-based Controllers + Services with Singleton Export
- Description: Convert `HealthController` and `HealthService` in `apps/livekit-server` into classes with intention-revealing methods, export each as a singleton, and rewire the route to delegate to the controller singleton using arrow-function class properties so Express binding of `this` is preserved without manual `.bind()` calls.

---

## Approach Summary

- The project is a small, idiomatic Express + TypeScript ESM service with no existing class precedent and no test infrastructure (Skip-Testing per `PROJECT_OVERVIEW.md`). The refactor is mechanical and tightly scoped: two source files change shape, one route file is rewired, and the rest of the composition (`app.ts`, `server.ts`, `routes/index.ts`) is untouched.
- For the controller, route handlers will be defined as **arrow-function class properties** (e.g., `public readonly getStatus = (req, res) => { ... }`). This permanently lexically binds `this` to the instance, so `router.get('/', healthController.getStatus)` works safely without bind boilerplate or wrapper closures at the route layer. This matches the project's preference for terse arrow-function handlers already seen in `errorHandler`, `notFoundHandler`, and `asyncHandler`.
- For the service, methods will be plain class methods (e.g., `public getStatus(): { status: string }`). Service methods are called via `this.service.getStatus()` from inside the controller, so `this`-binding loss is not a concern for them.
- Each module exports two things: the class (for future testability / DI) and a singleton instance (`export const healthController = new HealthController()`). Routes only import the singleton.
- SOLID/SRP: controller owns HTTP shape (status code, JSON envelope), service owns the domain answer ("am I healthy?"). Controller depends on the service singleton via direct import — keep it simple (KISS) until DI is actually needed.

## Functional Requirements

- `apps/livekit-server/src/services/health.service.ts` exports `class HealthService` and a named singleton `export const healthService = new HealthService()`.
- `HealthService` exposes `getStatus(): { status: string }` returning `{ status: 'ok' }` (behaviour-preserving).
- `apps/livekit-server/src/controllers/health.controller.ts` exports `class HealthController` and a named singleton `export const healthController = new HealthController()`.
- `HealthController` exposes a `getStatus` arrow-function class property typed as `RequestHandler` that returns `200` with the JSON body produced by `healthService.getStatus()`.
- `apps/livekit-server/src/routes/health.route.ts` calls `router.get('/', healthController.getStatus)` — no wrapper closures, no `.bind()`.
- Existing endpoint `GET /health` responds with HTTP 200 and body `{"status":"ok"}` exactly as before.
- `pnpm --filter livekit-server typecheck` passes.
- `pnpm --filter livekit-server lint` passes.
- `pnpm --filter livekit-server build` produces `dist/` without errors.

## Non-Functional Requirements

- Preserve ESM conventions: relative imports keep the `.js` suffix.
- Preserve strict TypeScript settings already enabled (`strict`, `verbatimModuleSyntax`, `exactOptionalPropertyTypes`, `noImplicitOverride`, `noImplicitReturns`). Notably, `verbatimModuleSyntax` requires `import type { RequestHandler } from 'express'` to stay a type-only import in the controller.
- SRP: controller handles HTTP concerns only; service handles domain logic only.
- KISS: a single shared singleton per module; no factory, no DI container, no decorator metadata.
- DRY: route file does not duplicate the service call — it only wires the method.
- Naming: `getStatus` (intention-revealing, matches REST verb), `HealthController`, `HealthService`, singletons `healthController`, `healthService` (lowerCamelCase matches existing `errorHandler`, `notFoundHandler` style).
- No behavioural change at the wire (same status code, same JSON body, same path).

## Files in Scope

- **Modify** — `apps/livekit-server/src/services/health.service.ts`
- **Modify** — `apps/livekit-server/src/controllers/health.controller.ts`
- **Modify** — `apps/livekit-server/src/routes/health.route.ts`
- **Verify only — no edits** — `apps/livekit-server/src/routes/index.ts`, `apps/livekit-server/src/app.ts`, `apps/livekit-server/src/server.ts`

## Risks & Assumptions

- "server also" was a typo for "services also" (confirmed with user).
- `this`-binding handled with arrow-function class properties (confirmed with user).
- No other code imports `getHealthStatus` or `healthController` (grep-verified).
- Skip-Testing honored (confirmed with user — Q1).
- Acceptance bar: typecheck + lint + build only (confirmed with user — Q2).
- Minimal class shape, single `getStatus` method only (confirmed with user — Q3).

## Open Questions / Blockers

- All resolved by user before approval. Status flipped to Ready to execute.

## Status

- [x] Ready to execute

## Task List

| #   | Status  | Task                                                                                                                                                                                                                               | Responsible Role | Dependencies | Skills       |
| --- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | DONE    | Refactor `health.service.ts` to `class HealthService` with `public getStatus(): { status: string }`. Export class + singleton `healthService`.                                                                                     | developer        | none         | `clean-code` |
| 2   | DONE    | Refactor `health.controller.ts` to `class HealthController` with arrow-property `getStatus: RequestHandler`. Import `healthService` singleton. Export class + singleton `healthController`. Keep `import type { RequestHandler }`. | developer        | task 1       | `clean-code` |
| 3   | DONE    | Update `health.route.ts`: `router.get('/', healthController.getStatus)`.                                                                                                                                                           | developer        | task 2       | `clean-code` |
| 4   | DONE    | Verification: `pnpm --filter livekit-server typecheck`, `lint`, `build`. All pass.                                                                                                                                                 | developer        | task 3       | `clean-code` |
| 5   | SKIPPED | Tests — skipped per Q1 (Skip-Testing honored).                                                                                                                                                                                     | tester           | task 4       | —            |

## Reviewer Decision

- **Accepted** — all checklist items pass; secret-scanner and security-scanner clean on the diff; `this`-binding correctly handled via arrow-property pattern; no out-of-scope files touched; behaviour parity preserved.
- Recommendations (non-blocking, deferred):
  1. Tighten `HealthService.getStatus()` return type from `{ status: string }` to a literal `{ status: 'ok' }` (or a `HealthStatus` interface) when more health states are added.
  2. If `HealthController` gains more dependencies, switch to constructor injection (`constructor(private readonly healthService: HealthService = healthService) {}`) for testability — not needed now under Skip-Testing.
