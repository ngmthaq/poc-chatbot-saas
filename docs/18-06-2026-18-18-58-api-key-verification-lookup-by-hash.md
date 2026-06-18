- Author: Root Agent
- Title: Plan — Task #8: API Key verification (lookup-by-hash)
- Classification: feature
- Description: Add an `ApiKeyService.verifyKey(raw)` that hashes a raw key, looks it up by unique `keyHash`, and returns the record or `null` using a constant-time-safe compare plus validity gates.

---

## Approach Summary

- Add an `ApiKeyService` (`apps/server/src/services/api-key.service.ts`) exposing `verifyKey(raw)`. It hashes the raw key via the existing `ApiKeyUtil.hashKey`, does a single `prisma.apiKey.findUnique({ where: { keyHash } })`, then applies a constant-time-safe compare (`crypto.timingSafeEqual`) plus validity gates (status `ACTIVE`, not revoked, not time-expired).
- Returns the full Prisma `ApiKey` record on success or `null` otherwise. Read-only: no row mutation.
- This keeps `ApiKeyUtil` pure and gives downstream tasks (#9 auth middleware, #10 scopes, #11 per-bot binding) the full record they need without an extra query.

## Functional Requirements

- `verifyKey(raw: string): Promise<ApiKey | null>` hashes input and looks up by unique `keyHash`.
- Returns `null` for: unknown key, malformed/empty input, `status !== ACTIVE` (covers `REVOKED`/`EXPIRED`), `revokedAt` set, and `expiresAt` in the past.
- Uses `crypto.timingSafeEqual` for the hash comparison (defense-in-depth against timing leaks).
- Returns the full `ApiKey` record (incl. `tenantId`, `scopes`, `botId`) on success.

## Non-Functional Requirements

- No raw key or hash logged anywhere (per AGENT_RULES + #7 precedent).
- Single DB round-trip; no writes on the auth hot path.
- Uses the shared `prisma` singleton (`utils/prisma.utils.ts`) and `ApiKeyUtil` — no ad-hoc instances.
- TypeScript strict-clean; `import type` for type-only imports; matches Prettier config.

## Files in Scope

- Create: `apps/server/src/services/api-key.service.ts`
- (No new type needed — returns Prisma's generated `ApiKey`. No services barrel exists; controllers instantiate services directly, so nothing else changes.)

## Risks & Assumptions

- Assumption: `findUnique` by `keyHash` makes the timing-safe compare largely redundant (DB already matched exactly), but the AC mandates it, so it's included as defense-in-depth.
- Assumption: Status reconciliation (flipping a time-expired key's `status` to `EXPIRED`) is out of scope — handled by a separate task.
- Risk: `timingSafeEqual` throws on unequal buffer lengths; both are 64-char SHA-256 hex, so lengths always match — guarded defensively regardless.

## Open Questions / Blockers

- None — all resolved in brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                          | Responsible Role | Dependencies | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 8.1 | DONE   | Create `ApiKeyService.verifyKey(raw)` in `services/api-key.service.ts`: hash → `findUnique` → timing-safe compare → validity gates (active/not-revoked/not-expired) → return `ApiKey \| null` | developer        | none         | `clean-code` |

> Testing skipped per project default (Testing Workflow = Skip-Testing) — no tester sub-agent.

---

## Outcome

- Delivered: `apps/server/src/services/api-key.service.ts` (`ApiKeyService.verifyKey` + private `hashesMatch` helper).
- Verification: `pnpm --filter server run typecheck` (`tsc --noEmit`) passed (exit 0); ESLint clean.
- Review (Root Agent): passed all dimensions — plan conformance, validity-gate ordering, constant-time compare, conventions, security. No re-delegation required.
- Tracking doc `17-06-2026-16-13-46-multi-tenant-saas-chatbot-platform.md` task #8 marked DONE.
