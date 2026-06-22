- Author: Root Agent
- Title: Plan — Implement `POST /admin/auth/logout`
- Classification: feature
- Description: Add an idempotent logout endpoint that revokes the single `AdminSession` matching a presented refresh token, always returning `200 { revoked: true }` regardless of token state.

---

## Approach Summary

- Extend the existing admin-auth files. `logout()` hashes the presented refresh token (`AdminTokenUtil.hashRefreshToken`) and revokes the matching active session with a single `updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: now } })`.
- `updateMany` is the key choice: it's idempotent (0 rows affected for unknown/already-revoked/expired tokens, never throws), and since `tokenHash` is unique it touches at most one row — so logout is single-session, side-effect-safe, and reveals nothing about token validity.
- The controller always returns `{ revoked: true }` for `responseHandler` to wrap with `200`.
- No `hashesMatch`/reuse-detection logic is needed here (logout doesn't return sensitive data and doesn't trust-elevate); a later replay of a logged-out token at `/refresh` is still correctly caught by refresh's existing reuse detection.

## Functional Requirements

- `POST /admin/auth/logout` accepts `{ refreshToken }` (JSON); missing/invalid → `422` via yup + `requestValidator`.
- A valid, active session matching the token is revoked (`revokedAt` set); response is `200 { revoked: true }`.
- Unknown / already-revoked / expired token → still `200 { revoked: true }` (idempotent, no enumeration).
- Only the session for the presented token is affected — other sessions for the same admin stay active.
- Guarded by the existing `authRateLimitHandler`.

## Non-Functional Requirements

- Security: idempotent, constant response (no token-state enumeration); operates only on the token hash; never logs the token/hash.
- Conventions: ESM, no `.js` extensions; types only in `src/types/admin-auth.d.ts`; class methods with JSDoc; Prisma singleton; `http-errors` (not needed here) + `responseHandler`; yup validator. Reuse existing infra — no duplication, no new deps, no schema change.

## Files in Scope

- Create:
  - `apps/server/src/validators/admin-logout.validator.ts` — yup `{ refreshToken }` + `AdminLogoutBody`.
- Modify:
  - `apps/server/src/types/admin-auth.d.ts` — add `AdminLogoutResult` (`{ revoked: true }`).
  - `apps/server/src/services/admin-auth.service.ts` — add `logout(body)` (idempotent, `void`).
  - `apps/server/src/controllers/admin-auth.controller.ts` — add `handleLogout`.
  - `apps/server/src/routes/admin-auth.route.ts` — add `POST /logout`.

## Risks & Assumptions

- Assumption: Logout self-identifies via the refresh token in the body (no auth middleware exists yet). When that middleware lands later, logout could optionally also accept the access token — out of scope now.
- Assumption: No dedicated `errorMessages` entry needed (idempotent success has no error branch).
- Note: A token revoked via logout, if later replayed at `/refresh`, will trigger refresh's reuse-detection (revoke-all). That's the correct theft response and is acceptable.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                       | Responsible Role | Dependencies | Skills                           |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Create `admin-logout.validator.ts` (yup `{ refreshToken }` required) + `AdminLogoutBody`; add `AdminLogoutResult` (`{ revoked: true }`) to `admin-auth.d.ts`.                                                              | developer        | none         | `clean-code`                     |
| 2   | DONE   | Add `AdminAuthService.logout(body): Promise<void>` — `hashRefreshToken` then `adminSession.updateMany({ where: { tokenHash, revokedAt: null }, data: { revokedAt: new Date() } })`. Idempotent; never throws on not-found. | developer        | 1            | `clean-code`, `security-scanner` |
| 3   | DONE   | Add `AdminAuthController.handleLogout` — call service, always `return { revoked: true }` for `responseHandler`.                                                                                                            | developer        | 2            | `clean-code`                     |
| 4   | DONE   | Add `POST /logout` to `admin-auth.route.ts` (`authRateLimitHandler` → `requestValidator(admin-logout schema)` → `responseHandler`). Keep `/login` + `/refresh` intact.                                                     | developer        | 3            | `clean-code`                     |
| 5   | DONE   | Run `pnpm --filter server lint` + `typecheck`; run `graphify update .`.                                                                                                                                                    | developer        | 4            | `clean-code`                     |

> Testing: Server workflow is Skip-Testing → no tester sub-agent. All tasks `developer`, sequential, single delegation. No migration.
