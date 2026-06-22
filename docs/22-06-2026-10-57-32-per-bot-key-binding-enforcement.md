- Author: Root Agent
- Title: Plan — [API] Per-bot key binding enforcement
- Classification: feature
- Description: Add a reusable `requireBotBinding(getBotId)` middleware (plus a pure `ApiKeyService.resolveBotBinding` helper) that compares an API key's bound `botId` against the request's target bot, rejecting mismatches with 403, injecting the bound bot when none is requested, and treating unbound keys as tenant-wide.

---

## Approach Summary

- Mirror the existing `requireScopes` pattern: a thin middleware factory that fail-closes on a missing `req.context`, delegates the decision to a pure, testable `ApiKeyService` helper, and uses the existing generic `errorMessages.unauthorized()` / `forbidden()`.
- The middleware takes an **accessor** `(req) => string | null | undefined` so it isn't coupled to where the target bot lives (no bot routes exist yet). On success it records the resolved bot on `req.context.effectiveBotId` for downstream use.
- Binding rules (per user decisions): **unbound key** (`botId === null`) → pass, effective = requested (or null); **bound + no target** → pass, inject bound as effective; **bound + matching target** → pass; **bound + mismatched target** → 403.
- Wire it minimally onto `POST /chat`: add an optional `botId` to `chatSchema` and mount the middleware after validation. No deepagent/bot-config plumbing (out of scope) — the bot is enforced and resolved, not yet consumed.

## Functional Requirements

- `resolveBotBinding(boundBotId, requestedBotId)` returns `{ allowed, effectiveBotId }` implementing the four rules above; pure, no I/O.
- `requireBotBinding(getBotId)` returns a `RequestHandler` that: 401s when `req.context` is undefined; 403s (`forbidden`) on a binding violation; otherwise sets `req.context.effectiveBotId` and calls `next()`.
- `chatSchema` accepts an optional, trimmed `botId`; `POST /chat` enforces binding via `requireBotBinding((req) => (req.body as ChatBody).botId ?? null)` mounted **after** `requestValidator`.
- Middleware is re-exported from `middlewares/index.ts`.

## Non-Functional Requirements

- Follow CODING_CONVENTIONS: ESM, no `.js` import extensions, kebab-case `*.middleware.ts`, types in `*.d.ts` (no inline `type`/`interface`), JSDoc on public methods, single source via `ApiKeyService`.
- Security: generic error messages (never reveal which bot/why); fail-closed on missing context; no secret/PII logging.
- No regression to existing scope enforcement or chat behavior; backward compatible (botId optional → existing clients unaffected).

## Files in Scope

- Modify `apps/server/src/types/request-context.d.ts` — add `effectiveBotId?: string | null`.
- Modify `apps/server/src/services/api-key.service.ts` — add `resolveBotBinding(...)` + JSDoc.
- Create `apps/server/src/middlewares/require-bot-binding.middleware.ts` — the factory.
- Modify `apps/server/src/middlewares/index.ts` — re-export `requireBotBinding`.
- Modify `apps/server/src/validators/chat.validator.ts` — optional `botId`.
- Modify `apps/server/src/routes/chat.route.ts` — mount middleware after validator.

## Risks & Assumptions

- Assumption: "Wire into existing route minimally" = add optional `botId` to the chat body + enforce; the value isn't yet used to select bot config (that's the out-of-scope "full plumbing").
- Assumption: `effectiveBotId` belongs on `RequestContext` (optional) as the forward-looking home for the resolved bot; the middleware mutates `req.context`.
- Assumption: `botId` is validated as a trimmed optional string (matching `threadId`), not strictly `.uuid()`, to avoid over-constraining — a wrong id simply fails the 403 binding check.
- Risk: none significant; change is additive and behind an optional field.

## Open Questions / Blockers

- None — all four design decisions resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status  | Task                                                                                                                                                                 | Responsible Role | Dependencies | Skills                                                                                          |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ----------------------------------------------------------------------------------------------- |
| 1   | DONE    | Add `effectiveBotId?: string \| null` to `RequestContext` in `request-context.d.ts`                                                                                  | developer        | none         | `clean-code`                                                                                    |
| 2   | DONE    | Add pure `resolveBotBinding(boundBotId, requestedBotId): { allowed; effectiveBotId }` to `ApiKeyService` with JSDoc, implementing the 4 rules                        | developer        | none         | `clean-code`                                                                                    |
| 3   | DONE    | Create `require-bot-binding.middleware.ts`: factory `requireBotBinding(getBotId)`, 401 on missing context, 403 on violation, set `effectiveBotId` + `next()` on pass | developer        | 1, 2         | `clean-code`                                                                                    |
| 4   | DONE    | Re-export `requireBotBinding` from `middlewares/index.ts`                                                                                                            | developer        | 3            | `clean-code`                                                                                    |
| 5   | DONE    | Add optional trimmed `botId` to `chatSchema` (`ChatBody`)                                                                                                            | developer        | none         | `clean-code`                                                                                    |
| 6   | DONE    | Mount `requireBotBinding` on `POST /chat` after `requestValidator`                                                                                                   | developer        | 3, 5         | `clean-code`                                                                                    |
| 7   | DONE    | Verify: `pnpm server typecheck` + `pnpm server lint` pass; run `pnpm format`                                                                                         | developer        | 1-6          | `clean-code`                                                                                    |
| —   | SKIPPED | Automated tests                                                                                                                                                      | tester           | —            | Project Testing Workflow = Skip-Testing (server has no test setup); no tester sub-agent spawned |
