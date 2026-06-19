- Author: Root Agent
- Title: Plan — [API] API-key auth middleware (parse + load)
- Classification: feature
- Description: Add an `apiKeyAuth(requiredScopes)` Express middleware that parses the Bearer API key, verifies it via the existing `ApiKeyService.verifyKey`, attaches the record to `req.apiKey`, enforces scopes, and best-effort touches `lastUsedAt`.

---

## Approach Summary

- Add an `apiKeyAuth(requiredScopes)` Express middleware (higher-order `RequestHandler`, mirroring the existing `requestValidator`/`fileValidator` HOF pattern). It parses the `Authorization: Bearer <key>` header, delegates verification to the existing `ApiKeyService.verifyKey`, attaches the resolved `ApiKey` record to `req.apiKey`, enforces required scopes, and best-effort touches `lastUsedAt`.
- All auth failures flow through `next(createHttpError(...))` into the existing error-handler. Business logic (scope check, `lastUsedAt` write) lives in `ApiKeyService`; the middleware stays thin.

## Functional Requirements

1. Missing `Authorization` header, or one not using the `Bearer ` scheme, or with an empty token → **401**.
2. Token that `verifyKey` resolves to `null` (unknown / revoked / expired / inactive) → **401**.
3. Valid key lacking a required scope → **403** (with `ADMIN` scope treated as granting all — see assumptions).
4. On success: `req.apiKey` is the full `ApiKey` record, and `next()` is called with no error.
5. On success: the key's `lastUsedAt` is updated (best-effort; a failed write logs a warning and does **not** fail the request).
6. The middleware is wired onto the `/chat` route requiring `ApiKeyScope.CHAT`.

## Non-Functional Requirements

- No raw key value or hash is ever logged (only `keyPrefix`/`tenantId` at most). Use the Pino `logger`, never `console`.
- Constant-time verification is already handled inside `verifyKey` — middleware adds no new comparison side-channels.
- Type-safe: `req.apiKey` typed via `Express.Request` augmentation; no `any`. Respect `strict`, `exactOptionalPropertyTypes`, `verbatimModuleSyntax`.

## Files in Scope

- Create: `apps/server/src/middlewares/api-key.middleware.ts`
- Create: `apps/server/src/types/express.d.ts` (Request augmentation — types live in `types/*.d.ts`)
- Modify: `apps/server/src/services/api-key.service.ts` (add `touchLastUsed`, `hasRequiredScopes`)
- Modify: `apps/server/src/configs/error-messages.ts` (add `unauthorized()`, `forbidden()`)
- Modify: `apps/server/src/middlewares/index.ts` (barrel export)
- Modify: `apps/server/src/routes/chat.route.ts` (wire middleware)

## Risks & Assumptions

- Assumption: Wire onto `/chat` with `ApiKeyScope.CHAT` (the natural match; the question's example named `/chat`).
- Assumption: `ADMIN` scope implies all other scopes (common SaaS convention).
- Assumption: Scope semantics = key must hold **every** required scope passed (AND, not OR). With a single `CHAT` requirement this is moot today.
- Risk: Wiring auth onto `/chat` makes the chat endpoint require a valid API key — the React client currently calls it without one. Intended per scope choice, but a behavior change for any existing unauthenticated caller.
- `lastUsedAt` write adds one DB `UPDATE` per authenticated request (best-effort, non-blocking on failure).

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                      | Responsible Role | Dependencies | Skills                           |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Add `unauthorized()` and `forbidden()` to `configs/error-messages.ts`, matching existing factory style                                                                                    | developer        | none         | `clean-code`                     |
| 2   | DONE   | Add `Express.Request` augmentation `apiKey?: ApiKey` in new `types/express.d.ts`                                                                                                          | developer        | none         | `clean-code`                     |
| 3   | DONE   | Extend `ApiKeyService` with `touchLastUsed(id)` (Prisma update of `lastUsedAt`) and `hasRequiredScopes(key, required)` (with ADMIN bypass)                                                | developer        | none         | `clean-code`, `security-scanner` |
| 4   | DONE   | Create `apiKeyAuth(requiredScopes)` middleware: parse Bearer → `verifyKey` → 401, scope check → 403, attach `req.apiKey`, best-effort `touchLastUsed`; export from `middlewares/index.ts` | developer        | 1,2,3        | `clean-code`, `security-scanner` |
| 5   | DONE   | Wire `apiKeyAuth([ApiKeyScope.CHAT])` onto `/chat` route ahead of `requestValidator`                                                                                                      | developer        | 4            | `clean-code`                     |
