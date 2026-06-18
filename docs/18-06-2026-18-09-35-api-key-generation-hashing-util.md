- Author: Root Agent (party-mode)
- Title: Plan — Task #7: API key generation + hashing utility
- Classification: feature
- Description: Add a stateless `ApiKeyUtil` to the server utils layer that generates a high-entropy raw API key and derives a deterministic SHA-256 hash plus an 8-char display prefix, never persisting or logging the raw value.

---

## Approach Summary

- A new `ApiKeyUtil` class (mirroring `LiveKitTokenUtil`) exposes `generateKey()` → `{ raw, keyHash, keyPrefix }` and a reusable `hashKey(raw)`.
- `raw` is 32 random bytes (`node:crypto.randomBytes`) base64url-encoded; `keyHash` is `sha256(raw)` hex; `keyPrefix` is `raw.slice(0, 8)`.
- The hash is a **plain deterministic SHA-256** (not bcrypt/argon2/HMAC) because the downstream task #8 looks the key up by the `@unique keyHash` column, which requires determinism.
- The utility neither logs nor persists the raw key — callers own persistence.

## Functional Requirements

- `generateKey()` returns `{ raw, keyHash, keyPrefix }` with raw = base64url(32 random bytes), keyPrefix = first 8 chars of raw, keyHash = `sha256(raw)` hex.
- `hashKey(raw)` returns the same deterministic hex hash (reusable by #8).
- Same raw → same hash (deterministic); different raws → different hashes/prefixes.

## Non-Functional Requirements

- Security: raw key never persisted or logged; CSPRNG (`crypto.randomBytes`) for entropy; no hardcoded secrets.
- Maintainability: stateless class, `node:crypto` only (zero new deps), follows `*.utils.ts` + `.d.ts` conventions, passes `strict` TS rules.

## Files in Scope

- Create `apps/server/src/utils/api-key.utils.ts` — `ApiKeyUtil` class.
- Create `apps/server/src/types/api-key.d.ts` — `GeneratedApiKey` interface.

## Decisions (confirmed with user)

- **Key format:** pure random base64url, **no** static identifiable prefix.
- **Hash algorithm:** plain deterministic **SHA-256 (hex)** — required so #8 can look up the key by the unique `keyHash`.
- **Constants placement:** the byte length (32), prefix length (8), and algorithm (`sha256`) live as `private readonly` instance fields on `ApiKeyUtil` (camelCase), mirroring the `private readonly` style of `livekit-token.utils.ts`.

## Risks & Assumptions

- base64url first-8-chars `keyPrefix` is display-only and not guaranteed unique — acceptable (the schema does not mark `keyPrefix` unique).
- No utils barrel exists in `apps/server/src/utils/`; callers import the file directly (matches current pattern).

## Status

- [x] Ready to execute / Done

## Task List

| #   | Status | Task                                                                                | Responsible Role | Dependencies | Skills                         |
| --- | ------ | ----------------------------------------------------------------------------------- | ---------------- | ------------ | ------------------------------ |
| 7a  | DONE   | Create `GeneratedApiKey` interface in `src/types/api-key.d.ts`                      | developer        | none         | `clean-code`                   |
| 7b  | DONE   | Create `ApiKeyUtil` (`generateKey()` + `hashKey()`) in `src/utils/api-key.utils.ts` | developer        | 7a           | `clean-code`, `secret-scanner` |

## Verification

- `pnpm --filter server typecheck` — clean (no errors).
- secret-scanner over the diff — no secrets; raw key is never logged or persisted.

## Follow-ups (out of scope for this task)

- #8 — Key verification (lookup-by-hash); `hashKey()` is intentionally `public` for reuse.
- #9 — API-key auth middleware (parse + load).
- Persistence of generated keys (controller/service) is owned by later Epic-B tasks.
