- Author: Root Agent
- Title: Plan — Implement `POST /admin/auth/refresh`
- Classification: feature
- Description: Add a refresh endpoint that exchanges a valid opaque refresh token for a new access token, with rotation + reuse detection (each refresh revokes the old `AdminSession` and mints a new one; replaying a revoked token revokes all of the admin's sessions), re-validating that the admin is still active.

---

## Approach Summary

- Extend the existing `AdminAuthService`/`AdminAuthController`/`admin-auth.route` rather than create a new trio.
- `refresh()` hashes the presented token (`AdminTokenUtil.hashRefreshToken`), looks up the `AdminSession` by its unique `tokenHash`, and confirms with the constant-time `hashesMatch` (mirroring `ApiKeyService`).
- Reuse-detection state machine: not-found → `null`; found-but-`revokedAt != null` → replay/theft → revoke every session for that `adminUserId`, return `null`; expired → revoke that session, `null`; otherwise re-load the `AdminUser`, reject if `!isActive` (`null`), then in one transaction revoke the old session (set `revokedAt`), create a new `AdminSession` (new `tokenHash`, fresh `expiresAt`, `userAgent`), and mint a new JWT access token.
- Every failure mode collapses to a single generic `401` at the controller — no enumeration of which token state failed.
- Each refresh token = its own `AdminSession` row; a revoked row stays in the table as the reuse-detection ledger (no schema change needed — `revokedAt` already exists).

## Functional Requirements

- `POST /admin/auth/refresh` accepts `{ refreshToken }` (JSON); missing/invalid → `422` via yup + `requestValidator`.
- Valid, unexpired, non-revoked token for an active admin → `200` with `{ accessToken, tokenType: "Bearer", expiresIn, refreshToken (newly rotated), admin: { id, email, name } }`.
- Unknown token, expired token, inactive admin → single generic `401`.
- Reuse detection: presenting an already-revoked token revokes all sessions for that admin, then returns generic `401`.
- On success: old session `revokedAt` is set and a brand-new `AdminSession` (new hash + `expiresAt = now + ADMIN_REFRESH_TOKEN_TTL_DAYS`) is created atomically.
- Guarded by the existing `authRateLimitHandler` (`429` on abuse).

## Non-Functional Requirements

- Security: constant-time hash compare; generic `401` for all failures (no enumeration); only refresh-token hashes persisted; rotation invalidates the consumed token; reuse → full session revocation; never log tokens/hashes.
- Conventions: ESM, no `.js` extensions; types only in `src/types/admin-auth.d.ts`; class methods with JSDoc; Prisma singleton; `http-errors` + `responseHandler`; yup validators. Reuse existing `AdminTokenUtil`/env/limiter — no duplication.

## Files in Scope

- Create:
  - `apps/server/src/validators/admin-refresh.validator.ts` — yup `{ refreshToken }` + `AdminRefreshBody`.
- Modify:
  - `apps/server/src/types/admin-auth.d.ts` — add `AdminRefreshResult` (alias of the login result shape) + refresh options if needed.
  - `apps/server/src/services/admin-auth.service.ts` — add `refresh()` + a private `revokeAllSessions(adminUserId)` helper.
  - `apps/server/src/controllers/admin-auth.controller.ts` — add `handleRefresh`.
  - `apps/server/src/routes/admin-auth.route.ts` — add `POST /refresh` (limiter → validator → responseHandler).
  - `apps/server/src/configs/error-messages.ts` — add `invalidRefreshToken()` (generic, e.g. "Invalid or expired refresh token").

## Risks & Assumptions

- Assumption: Refresh TTL on rotation = the same `ADMIN_REFRESH_TOKEN_TTL_DAYS` (sliding expiry — each refresh extends the window).
- Assumption: Revoked `AdminSession` rows are retained as the reuse-detection ledger; periodic cleanup of expired/revoked rows is out of scope (future task).
- Assumption: No `replacedBy`/family column is added — reuse detection relies solely on `revokedAt`, which is sufficient for "any revoked token replay = theft".
- Scope: logout and the access-token verification middleware remain out of scope.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                                                                                                                                                  | Responsible Role | Dependencies | Skills                           |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Create `admin-refresh.validator.ts` (yup `{ refreshToken }` required) + `AdminRefreshBody`; add `AdminRefreshResult` to `admin-auth.d.ts`; add `invalidRefreshToken()` to `error-messages.ts`.                                                                                                                                                        | developer        | none         | `clean-code`                     |
| 2   | DONE   | Add `AdminAuthService.refresh(body, opts)` — hash + `findUnique` by `tokenHash` + `hashesMatch`; reuse-detection state machine (revoked→revoke-all+null, expired→revoke+null, not-found→null); re-check `isActive`; transaction: revoke old + create rotated session; mint new access token; return result/`null`. Add private `revokeAllSessions()`. | developer        | 1            | `clean-code`, `security-scanner` |
| 3   | DONE   | Add `AdminAuthController.handleRefresh` — call service, generic `401` on `null`, pass `user-agent`; return result for `responseHandler`.                                                                                                                                                                                                              | developer        | 2            | `clean-code`                     |
| 4   | DONE   | Add `POST /refresh` to `admin-auth.route.ts` (`authRateLimitHandler` → `requestValidator(admin-refresh schema)` → `responseHandler`).                                                                                                                                                                                                                 | developer        | 3            | `clean-code`                     |
| 5   | DONE   | Run `pnpm --filter server lint` + `typecheck`; run `graphify update .`.                                                                                                                                                                                                                                                                               | developer        | 4            | `clean-code`                     |

> Testing: Server workflow is Skip-Testing → no tester sub-agent. All tasks `developer`, sequential, single delegation. No DB migration (no schema change).
