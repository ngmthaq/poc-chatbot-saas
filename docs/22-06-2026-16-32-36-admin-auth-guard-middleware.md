- Author: Root Agent
- Title: Plan — Implement Admin auth-guard middleware
- Classification: feature
- Description: Add a reusable `adminAuth()` Express middleware that authenticates a request via its `Authorization: Bearer <accessToken>` JWT, re-loads and re-validates the `AdminUser` (active check), attaches the sanitized record to `req.adminUser`, and rejects everything else with a generic `401`.

---

## Approach Summary

- Mirror the existing `apiKeyAuth()` middleware exactly. A new `adminAuth()` parses the Bearer token, delegates verification to a new `AdminAuthService.authenticateAccessToken(token)` — which verifies the JWT via the existing `AdminTokenUtil.verifyAccessToken` (catching `jose` errors → `null`), reads the `sub` claim, loads the `AdminUser` with `passwordHash` omitted, and returns the record only if it exists and `isActive` — then attaches it to `req.adminUser` and calls `next()`.
- Any failure (missing/malformed header, invalid/expired token, missing `sub`, unknown or inactive admin) collapses to a single generic `401` (`errorMessages.unauthorized()`), so the guard never reveals why it failed.
- The request type is augmented in `express.d.ts` (mirroring `req.apiKey`/`req.context`).

## Functional Requirements

- `adminAuth()` returns an Express `RequestHandler` usable as route middleware.
- Missing/malformed `Authorization` header → `401`.
- Invalid/expired/wrong-algorithm JWT → `401`.
- Valid JWT but unknown admin (`sub` not found) or `isActive === false` → `401`.
- Valid JWT for an active admin → `req.adminUser` is set to the `AdminUser` without `passwordHash`, then `next()`.
- All `401`s use the same generic message (no enumeration of failure cause).

## Non-Functional Requirements

- Security: explicit JWT algorithm allowlist (already in `verifyAccessToken`); `passwordHash` never attached to the request; generic 401; access token never logged; errors routed through `next(err)` to the central `errorHandler`.
- Conventions: ESM, no `.js` extensions; types only in `src/types/*.d.ts`; class method with JSDoc; Prisma singleton (`omit`/`select` to drop `passwordHash`); `http-errors`; exported from `middlewares/index.ts`. Reuse existing utils — no new deps, no schema change.

## Files in Scope

- Create:
  - `apps/server/src/middlewares/admin-auth.middleware.ts` — `adminAuth()` (+ local `parseBearerToken` mirroring `api-key.middleware.ts`).
- Modify:
  - `apps/server/src/services/admin-auth.service.ts` — add `authenticateAccessToken(token): Promise<AuthenticatedAdmin | null>`.
  - `apps/server/src/types/admin-auth.d.ts` — add `AuthenticatedAdmin = Omit<AdminUser, 'passwordHash'>`.
  - `apps/server/src/types/express.d.ts` — add `adminUser?: AuthenticatedAdmin`.
  - `apps/server/src/middlewares/index.ts` — export `adminAuth`.

## Risks & Assumptions

- Assumption: `req.adminUser` is the chosen attachment name/shape (sanitized record); handlers needing the id read `req.adminUser.id`.
- Low / accepted: `parseBearerToken` is duplicated locally rather than extracting a shared util (extracting would touch the working `api-key.middleware.ts` — out of scope). Flagged as an optional future refactor.
- Scope: the guard is built and exported but not wired onto any route (none are admin-protected yet). Scope/role checks (an admin equivalent of `requireScopes`) are out of scope.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                                 | Responsible Role | Dependencies | Skills                           |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Add `AuthenticatedAdmin = Omit<AdminUser, 'passwordHash'>` to `admin-auth.d.ts`; augment `express.d.ts` with `adminUser?: AuthenticatedAdmin`.                                                                                       | developer        | none         | `clean-code`                     |
| 2   | DONE   | Add `AdminAuthService.authenticateAccessToken(token)` — `verifyAccessToken` (catch → `null`), validate `sub`, `findUnique` admin omitting `passwordHash`, reject if missing/`!isActive`, return `AuthenticatedAdmin \| null`. JSDoc. | developer        | 1            | `clean-code`, `security-scanner` |
| 3   | DONE   | Create `admin-auth.middleware.ts` `adminAuth()` mirroring `apiKeyAuth` — `parseBearerToken`, generic `401` on `null`, attach `req.adminUser`, `next()`, `next(err)` on throw. Export from `middlewares/index.ts`.                    | developer        | 2            | `clean-code`, `security-scanner` |
| 4   | DONE   | Run `pnpm --filter server lint` + `typecheck`; run `graphify update .`.                                                                                                                                                              | developer        | 3            | `clean-code`                     |

> Testing: Server workflow is Skip-Testing → no tester sub-agent. All tasks `developer`, sequential, single delegation. No migration.
