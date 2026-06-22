- Author: Root Agent
- Title: Plan — Implement `POST /admin/auth/login`
- Classification: feature
- Description: Add a platform-admin login endpoint that verifies email + password (bcrypt), issues a short-lived JWT access token plus an opaque refresh token persisted (hashed) in `AdminSession`, updates `lastLoginAt`, and returns the tokens in the JSON body — protected by a strict per-route rate limiter and a generic 401.

---

## Approach Summary

- Follow the established `route → controller → service → utils` layering. A new `AdminAuthService` orchestrates: look up `AdminUser` by email → verify password with the existing `PasswordUtil` → reject inactive accounts → mint a JWT access token + a random opaque refresh token → persist the refresh token's SHA-256 hash as an `AdminSession` row → stamp `lastLoginAt`.
- Token mechanics live in a new `AdminTokenUtil` (JWT signing via `jose`, refresh-token generation + hashing reusing the SHA-256 + `timingSafeEqual` convention already used by `ApiKeyService`).
- A dedicated strict rate limiter guards the route; all failure modes (unknown email, wrong password, inactive user) return one generic 401 with constant-ish timing (verify against a dummy hash when the user is absent) to prevent account enumeration.

## Functional Requirements

- `POST /admin/auth/login` accepts `{ email, password }` (JSON); invalid/missing fields → `422` via yup + `requestValidator`.
- Valid credentials for an active admin → `200` with `{ accessToken, tokenType: "Bearer", expiresIn, refreshToken, admin: { id, email, name } }`.
- Unknown email OR wrong password OR `isActive === false` → single generic `401` (no enumeration, no field-specific hints).
- On success: an `AdminSession` row is created storing only the refresh token's hash, `expiresAt`, and `userAgent`; `AdminUser.lastLoginAt` is updated.
- Access token is a signed JWT (subject = admin id) with a short TTL; refresh token is a high-entropy opaque random string returned raw (only its hash is stored).
- A strict per-route rate limiter returns `429` when exceeded (skipped in development, matching the existing limiter).

## Non-Functional Requirements

- Security: never log password/tokens/hashes; constant-time hash compare (`timingSafeEqual`); generic error + dummy-hash verification to mitigate timing/enumeration; JWT secret sourced from env (never hard-coded).
- Conventions: ESM, no `.js` import extensions; types in `src/types/*.d.ts` (never inline); classes with `public`/`private` + JSDoc on public methods; Prisma via the `prisma.utils.ts` singleton; errors via `http-errors`; responses via `responseHandler`; `humps` at boundaries if needed.
- Maintainability: token TTLs and secret centralized in `env.ts`.

## Files in Scope

- Create:
  - `apps/server/src/validators/admin-login.validator.ts` — yup schema + `AdminLoginBody` type.
  - `apps/server/src/utils/admin-token.utils.ts` — `AdminTokenUtil`: sign/verify JWT, generate + hash refresh token.
  - `apps/server/src/services/admin-auth.service.ts` — `AdminAuthService.login()`.
  - `apps/server/src/controllers/admin-auth.controller.ts` — `AdminAuthController.handleLogin`.
  - `apps/server/src/routes/admin-auth.route.ts` — wires `POST /login` + limiter + validator + responseHandler.
  - `apps/server/src/types/admin-auth.d.ts` — `AdminLoginResult`, `AdminAccessTokenPayload`, etc.
- Modify:
  - `apps/server/src/routes/index.ts` — mount `adminAuthRouter` at `/admin/auth`.
  - `apps/server/src/configs/env.ts` — add `ADMIN_JWT_SECRET` (required), `ADMIN_ACCESS_TOKEN_TTL` (default `15m`), `ADMIN_REFRESH_TOKEN_TTL_DAYS` (default `7`).
  - `apps/server/src/configs/error-messages.ts` — add `invalidCredentials()` + `tooManyAuthAttempts()`.
  - `apps/server/src/middlewares/rate-limit.middleware.ts` — export a stricter `authRateLimitHandler` (e.g. max 10 / 15 min, IP-keyed, dev-skipped).
  - `apps/server/package.json` — add `jose` dependency (`pnpm --filter server add jose`).
  - Server env template (`.env.example`/scaffold, if present) — add the new keys (names only, no values).

## Risks & Assumptions

- Assumption (default, adjustable): Access TTL `15m`, refresh TTL `7d`; refresh token = 32 random bytes base64url; response shape as above.
- Assumption: JWT lib = `jose` (ESM-native, ships its own types — cleaner fit than `jsonwebtoken` + `@types`).
- Assumption: `AdminUser`/`AdminSession` tables are already migrated (schema exists in `admin.prisma`); no migration task included. Risk if not migrated — login will fail at runtime; developer verifies a migration exists and flags a blocker if not.
- Assumption: Seeding the first `AdminUser` (registration/seed) is out of scope — login assumes an admin row exists.
- Scope: refresh, logout, and the access-token verification middleware for protected routes are out of scope (separate tasks).

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                             | Responsible Role | Dependencies | Skills                           |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Add `ADMIN_JWT_SECRET` + access/refresh TTL keys to `env.ts`; add `invalidCredentials()` + `tooManyAuthAttempts()` to `error-messages.ts`; add `jose` dep to server.             | developer        | none         | `clean-code`, `secret-scanner`   |
| 2   | DONE   | Create `admin-auth.d.ts` types + `admin-login.validator.ts` (yup `{ email, password }`).                                                                                         | developer        | none         | `clean-code`                     |
| 3   | DONE   | Create `AdminTokenUtil` — JWT sign/verify (`jose`) + opaque refresh token generate & SHA-256 hash (reuse `timingSafeEqual` pattern).                                             | developer        | 1, 2         | `clean-code`, `secret-scanner`   |
| 4   | DONE   | Create `AdminAuthService.login()` — lookup, bcrypt verify + dummy-hash on miss, active check, mint tokens, persist `AdminSession`, stamp `lastLoginAt`, generic-null on failure. | developer        | 3            | `clean-code`, `security-scanner` |
| 5   | DONE   | Create `AdminAuthController.handleLogin` — map service result → `200` body or generic `401`.                                                                                     | developer        | 4            | `clean-code`                     |
| 6   | DONE   | Add `authRateLimitHandler` to `rate-limit.middleware.ts`; create `admin-auth.route.ts`; mount at `/admin/auth` in `routes/index.ts`.                                             | developer        | 5            | `clean-code`                     |
| 7   | DONE   | Verify admin tables are migrated; run `pnpm server lint` + `pnpm server typecheck`; run `graphify update .`.                                                                     | developer        | 6            | `clean-code`                     |

> Testing: Server workflow is Skip-Testing → no tester sub-agent. All tasks are `developer`. Single developer delegation, executed in order.
