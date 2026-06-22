- Author: Root Agent
- Title: Plan — [API] Tenant context + scope enforcement
- Classification: feature
- Description: Refactor apiKeyAuth into auth + tenant-context injection, extract scope enforcement into a standalone requireScopes(...scopes) middleware, and re-wire /chat.

---

## Approach Summary

- Refactor the just-shipped `apiKeyAuth` into an authentication + context-injection middleware (drop its `requiredScopes` param), and extract scope enforcement into a new standalone `requireScopes(...scopes)` middleware.
- On successful auth, `apiKeyAuth` injects a structured `req.context = { tenantId, apiKeyId, scopes, botId }` (derived from the already-loaded `ApiKey` record — no extra DB read). `requireScopes` reads `req.context.scopes` and returns 403 when the key lacks a required scope (AND semantics, ADMIN bypasses). `/chat` is re-wired to compose `apiKeyAuth(), requireScopes(ApiKeyScope.CHAT)`.
- External behavior (401 then 403) is unchanged; the concerns are now composable and tenant context is available to downstream handlers/services.

## Functional Requirements

1. On successful authentication, `req.context` is set to `{ tenantId, apiKeyId, scopes, botId }` sourced from the verified `ApiKey` record (`botId` is `string | null`).
2. `apiKeyAuth()` no longer takes scopes and no longer returns 403 — it only authenticates (401 on missing/invalid) and injects context + `req.apiKey`.
3. `requireScopes(...required)` returns 403 (`forbidden`) when `req.context.scopes` does not satisfy `required`; passes through when satisfied.
4. Scope semantics: empty `required` → allow; key holding `ApiKeyScope.ADMIN` → allow; otherwise the key must hold every required scope (AND).
5. If `requireScopes` runs without an authenticated `req.context`, it returns 401 (fail-closed, no leak).
6. `/chat` POST is gated by `apiKeyAuth()` then `requireScopes(ApiKeyScope.CHAT)`, ahead of `requestValidator`.

## Non-Functional Requirements

- No new DB query — context is built from the record `verifyKey` already returns.
- Type-safe: `req.context` typed via `Express.Request` augmentation referencing a reusable `RequestContext` interface; no `any`. Respect `strict`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.
- No raw key/hash logged; use Pino `logger`. Errors via `createHttpError` → existing error-handler.

## Files in Scope

- Create: `apps/server/src/types/request-context.d.ts` (`RequestContext` interface)
- Create: `apps/server/src/middlewares/require-scopes.middleware.ts` (`requireScopes`)
- Modify: `apps/server/src/types/express.d.ts` (add `context?: RequestContext`)
- Modify: `apps/server/src/middlewares/api-key.middleware.ts` (drop scopes param, inject `req.context`, remove scope check)
- Modify: `apps/server/src/services/api-key.service.ts` (`hasRequiredScopes(scopes, required)`)
- Modify: `apps/server/src/middlewares/index.ts` (export `requireScopes`)
- Modify: `apps/server/src/routes/chat.route.ts` (re-wire)

## Risks & Assumptions

- Assumption: Tenant-context injection lives inside `apiKeyAuth` (it already holds the record) rather than a third middleware — avoids an ordering footgun and a redundant lookup.
- Assumption: `hasRequiredScopes` signature changes to `(scopes, required)`. Only `apiKeyAuth` called it (call being removed), so no other caller breaks.
- Assumption: `req.context` is the property name. Express has no native `context`, so no collision.
- Risk: Edits code committed in #9 (`apiKeyAuth` signature). `/chat` is the only caller and is updated in the same change. Net external behavior identical.
- Downstream consumption of `req.context` (conversation upsert by tenantId) is out of scope here — ticket #39 consumes it.

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                         | Responsible Role | Dependencies | Skills                           |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Create `types/request-context.d.ts` exporting `RequestContext { tenantId: string; apiKeyId: string; scopes: ApiKeyScope[]; botId: string \| null }`                                                          | developer        | none         | `clean-code`                     |
| 2   | DONE   | Augment `Express.Request` with `context?: RequestContext` in `types/express.d.ts` (import type from `./request-context`)                                                                                     | developer        | 1            | `clean-code`                     |
| 3   | DONE   | Refactor `ApiKeyService.hasRequiredScopes` to `(scopes: ApiKeyScope[], required: ApiKeyScope[])` keeping empty-allow / ADMIN-bypass / AND semantics                                                          | developer        | none         | `clean-code`, `security-scanner` |
| 4   | DONE   | Refactor `apiKeyAuth`: remove `requiredScopes` param + scope/403 branch; after verify, set `req.apiKey` and `req.context = { tenantId, apiKeyId, scopes, botId }`; keep best-effort `touchLastUsed`          | developer        | 1,2          | `clean-code`, `security-scanner` |
| 5   | DONE   | Create `require-scopes.middleware.ts`: `requireScopes(...required: ApiKeyScope[]): RequestHandler` → 401 if no `req.context`, 403 via `hasRequiredScopes`, else `next()`; export from `middlewares/index.ts` | developer        | 2,3          | `clean-code`, `security-scanner` |
| 6   | DONE   | Re-wire `routes/chat.route.ts` to `apiKeyAuth(), requireScopes(ApiKeyScope.CHAT)` before `requestValidator`                                                                                                  | developer        | 4,5          | `clean-code`                     |
