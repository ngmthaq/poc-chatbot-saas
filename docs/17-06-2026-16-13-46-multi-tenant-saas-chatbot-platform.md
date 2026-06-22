# Multi-Tenant SaaS Chatbot Platform — Full Build Breakdown

**Date:** 17/06/2026 16:13:46
**Source:** Plan doc — `docs/17-06-2026-15-11-20-chatbot-saas-db-schema.md` (DB schema) + codebase audit
**Type:** Epic → multiple feature tickets

---

## Goal

Turn the existing chat prototype into a sellable multi-tenant SaaS: tenants are provisioned by platform admins, admins manage tenants/bots/keys, customers embed a key-authenticated chat widget (text + voice), conversations are persisted, agents answer from uploaded knowledge documents via a document-reading tool, and usage is metered and billed — all built on top of the already-implemented Prisma schema.

## Scope

1. DB extensions (admin sessions, billing/plan tables, voice bot config, voice providers)
2. API-key lifecycle (generate/hash/verify), auth middleware, tenant isolation, scopes, per-bot binding
3. Admin authentication (JWT access + refresh) and auth-guard middleware
4. Per-key rate-limiting and usage metering
5. Tenant / API-key / Bot / Knowledge-document management APIs
6. Text agent: conversation & message persistence, end-user resolution, bot-config loading, document-reading tool
7. Voice SaaS: key-authed LiveKit tokens, per-bot voice config, voice persistence, voice document tool, voice usage metering
8. Embeddable chat widget (text + voice) and embed loader
9. Admin portal UI (auth, tenants, bots, keys, knowledge base, conversations, usage/billing)
10. Billing (usage rollup, plans/subscriptions, invoicing/reporting)
11. Cross-cutting: per-tenant logging, secret hygiene, prod infra, CD migrations, env validation, API docs

## Out of Scope / Assumptions

- **Already done:** the DB schema from the source plan is implemented (migration `20260617154242_init_chatbot_schema`); this breakdown builds on it.
- **Admin auth** = JWT access + refresh token (refresh persisted for revocation).
- **Tenants are admin-provisioned** — no public self-signup / Stripe checkout in this phase.
- **Billing** = usage metering + invoice/reporting; no live payment processor integration.
- **Multi-tenancy** enforced at the application layer (tenantId filter in middleware), not Postgres RLS.
- **Knowledge base** = document-reading tool the agent calls at answer time; **no RAG / embeddings / pgvector**.
- **Voice** is in scope (SaaS-ify the LiveKit voice agent).
- **Testing** folded into each ticket's acceptance criteria (project Testing Workflow = `Skip-Testing`).

## Key Technical Areas

- DB schema / Prisma migrations
- Backend API (Express, TypeScript) — auth, middleware, CRUD, agent wiring
- deepagent (LangChain) text agent + tools
- livekit-agent voice agent + tools
- Frontend (React + Vite) — embeddable widget + admin portal
- Billing/metering logic + scheduled jobs
- Infra (Docker Compose, CD), observability, docs

## Risks / Open Questions

- Atomicity of usage counters under concurrency (lost-update risk on `ApiKeyUsage`).
- Voice usage metering accuracy (minutes) depends on LiveKit webhook reliability; partial-transcript flush on dropped calls.
- `Provider` DB enum must stay aligned with both `deepagent` (text) and `livekit-agent` (voice) `ProviderType` values.
- Widget isolation (no host CSS/JS leakage) across arbitrary customer pages.
- Migration churn from splitting DB changes into multiple migrations (acceptable for traceability).

---

## Subtask Breakdown

**Status legend:** `TODO` · `IN PROGRESS` · `BLOCKED` · `DONE`

| #   | Status | Title                                                       | Acceptance Criteria                                                      | Depends On |
| --- | ------ | ----------------------------------------------------------- | ------------------------------------------------------------------------ | ---------- |
| 1   | DONE   | [DB] `AdminSession` refresh-token model + migration         | Model + migration apply; cascade on AdminUser delete; index on tokenHash | —          |
| 2   | DONE   | [DB] `Plan` + `Subscription` models + migration             | Models + migration apply; FK indexed; tenant cascade                     | —          |
| 3   | DONE   | [DB] `UsageRollup` model + migration                        | Migration applies; unique `(tenantId, periodStart)`                      | —          |
| 4   | DONE   | [DB] `Invoice` + `InvoiceLineItem` models + migration       | Migration applies; cascade invoice→line items                            | 2, 3       |
| 5   | DONE   | [DB] Extend `Provider` enum for voice providers + migration | Additive enum; existing rows unaffected                                  | —          |
| 6   | DONE   | [DB] Add voice config fields to `Bot` + migration           | voiceEnabled/stt/tts/voiceId added; existing bots text-only              | 5          |
| 7   | DONE   | [Logic] Key generation + hashing utility                    | `{raw, keyHash, keyPrefix}`; raw never persisted/logged                  | —          |
| 8   | DONE   | [Logic] Key verification (lookup-by-hash)                   | Returns null for unknown/expired/revoked; constant-time compare          | 7          |
| 9   | DONE   | [API] API-key auth middleware (parse + load)                | Attaches `req.apiKey`; 401 missing/invalid                               | 8          |
| 10  | DONE   | [API] Tenant context + scope enforcement                    | Injects tenantId + scopes; 403 insufficient scope                        | 9          |
| 11  | DONE   | [API] Per-bot key binding enforcement                       | Bound key works for its bot; 403 others; null = all                      | 10         |
| 12  | DONE   | [Logic] Update `lastUsedAt` on successful auth              | Async/throttled update; no latency impact                                | 9          |
| 13  | DONE   | [Logic] Password hash/verify utility                        | argon2/bcrypt round-trip; wrong pw fails                                 | —          |
| 14  | TODO   | [API] `POST /admin/auth/login`                              | 200 access+refresh; 401 bad creds; 403 inactive                          | 1, 13      |
| 15  | TODO   | [API] `POST /admin/auth/refresh`                            | Rotates refresh; 401 unknown/expired/reused                              | 14         |
| 16  | TODO   | [API] `POST /admin/auth/logout`                             | Revokes refresh; reuse → 401                                             | 14         |
| 17  | TODO   | [API] Admin auth-guard middleware                           | Verifies JWT + isAdmin/isActive; 401/403                                 | 14         |
| 18  | TODO   | [Logic] Usage counter increment                             | Atomic upsert; concurrency-safe                                          | 9          |
| 19  | TODO   | [API] Rate-limit middleware                                 | 429 + Retry-After when over window limit                                 | 18, 2      |
| 20  | TODO   | [API] `POST /admin/tenants`                                 | 201; 409 dup slug; 400 invalid                                           | 17         |
| 21  | TODO   | [API] `GET /admin/tenants`                                  | Paginated list; empty → []                                               | 17         |
| 22  | TODO   | [API] `GET /admin/tenants/:id`                              | 200 with counts; 404 unknown                                             | 17         |
| 23  | TODO   | [API] `PATCH /admin/tenants/:id`                            | 200; 409 conflict; 404 unknown                                           | 20         |
| 24  | TODO   | [API] `DELETE /admin/tenants/:id`                           | Archive/delete; archived keys stop authenticating                        | 20         |
| 25  | TODO   | [API] `POST /admin/tenants/:id/keys`                        | 201 raw key once; 400 scope; 404 unknown                                 | 17, 7, 20  |
| 26  | TODO   | [API] `GET /admin/tenants/:id/keys`                         | Prefix-only list; never raw/hash                                         | 17, 20     |
| 27  | TODO   | [API] `PATCH /admin/keys/:keyId`                            | Update scopes/expiry/botId; 404/400                                      | 25         |
| 28  | TODO   | [API] `POST /admin/keys/:keyId/revoke`                      | Sets revokedAt; key fails auth after                                     | 25         |
| 29  | TODO   | [API] `POST /admin/tenants/:id/bots`                        | 201; 400 invalid provider/model; 404 tenant                              | 17, 20     |
| 30  | TODO   | [API] `GET` bots (list + detail)                            | 200; 404 unknown                                                         | 17, 29     |
| 31  | TODO   | [API] `PATCH /admin/bots/:botId` (text config)              | 200; 400 invalid provider/model                                          | 29         |
| 32  | TODO   | [API] `PATCH /admin/bots/:botId/voice`                      | 200; 400 voice provider not in enum                                      | 29, 6      |
| 33  | TODO   | [API] `PATCH /admin/bots/:botId/status`                     | Enable/disable; disabled rejects chat/voice                              | 29         |
| 34  | TODO   | [API] `DELETE /admin/bots/:botId`                           | 204; 404; guards dependent conversations                                 | 29         |
| 35  | TODO   | [API] `POST /admin/bots/:botId/documents` (upload)          | 201; 400 unsupported type; 413 oversize                                  | 17, 29     |
| 36  | TODO   | [API] `GET` documents (list + metadata)                     | 200; empty → []; 404 unknown                                             | 17, 35     |
| 37  | TODO   | [API] `GET /admin/documents/:docId/content`                 | 200 content; 404; tenant-scoped                                          | 35         |
| 38  | TODO   | [API] `DELETE /admin/documents/:docId`                      | Removes metadata + content; 204                                          | 35         |
| 39  | TODO   | [Logic] Upsert `Conversation` by `(tenantId, threadId)`     | New creates, existing reused; bot/key linked                             | 10, 29     |
| 40  | TODO   | [Logic] Append `Message` rows                               | User + assistant persisted; order preserved                              | 39         |
| 41  | TODO   | [Logic] Update `lastMessageAt`                              | Reflects latest message timestamp                                        | 40         |
| 42  | TODO   | [Logic] `EndUser` upsert by `(tenantId, externalId)`        | Create/reuse; null = anonymous                                           | 39         |
| 43  | TODO   | [Logic] Resolve bot in `chat.service.ts`                    | Correct bot; disabled/missing → 4xx                                      | 11, 29     |
| 44  | TODO   | [Logic] Inject bot config into text agent                   | Uses bot prompt/provider/model/greeting                                  | 43         |
| 45  | TODO   | [Logic] Doc tool — list docs for tenant/bot                 | In-scope docs only; cross-tenant excluded                                | 37, 44     |
| 46  | TODO   | [Logic] Doc tool — fetch content (scoped guard)             | Valid returns content; cross-tenant refused                              | 45         |
| 47  | TODO   | [Logic] Register doc tool with deepagent                    | LLM can call; no docs → graceful empty                                   | 46         |
| 48  | TODO   | [API] Gate `/livekit` token with key auth + VOICE scope     | Valid → token; 403 missing scope/voice off                               | 10, 33     |
| 49  | TODO   | [Logic] Embed tenantId/botId in room metadata/grants        | Agent can read them from room                                            | 48         |
| 50  | TODO   | [Logic] Voice agent resolves bot from room metadata         | Correct bot; missing → default + log                                     | 49, 30     |
| 51  | TODO   | [Logic] Voice agent applies bot LLM/STT/TTS/voice config    | Bot voice config applied                                                 | 50, 6      |
| 52  | TODO   | [Logic] Persist voice `Conversation` (channel=VOICE)        | Row created, linked to bot/endUser/key                                   | 49, 39     |
| 53  | TODO   | [Logic] Persist transcript `Message`s via webhook           | Transcript turns saved with roles                                        | 52         |
| 54  | TODO   | [Logic] Flush partial transcript on call end/drop           | No data loss on abnormal end                                             | 53         |
| 55  | TODO   | [Logic] Doc-read tool for voice agent                       | Voice answers from docs; cross-tenant blocked                            | 51, 46     |
| 56  | TODO   | [Logic] Voice usage metering                                | Minutes/sessions counted; over-limit denies room                         | 54, 19     |
| 57  | TODO   | [FE] Embeddable widget build target                         | Isolated self-contained bundle                                           | —          |
| 58  | TODO   | [FE] Widget text chat (key + threadId → /chat)              | Works on blank page; threadId persisted                                  | 57, 40     |
| 59  | TODO   | [FE] Widget loading/error/empty states                      | Invalid key → clear error, no crash                                      | 58         |
| 60  | TODO   | [FE] Widget voice mode                                      | Connects key-authed LiveKit; hidden if disabled                          | 58, 48     |
| 61  | TODO   | [FE] Embed loader `<script>` snippet                        | Snippet boots widget; bad attrs graceful                                 | 58         |
| 62  | TODO   | [FE] Widget theming/config from `/config`                   | Theme applied; default fallback                                          | 58         |
| 63  | TODO   | [FE] Admin app scaffold                                     | Routing/layout/auth store; app boots                                     | —          |
| 64  | TODO   | [FE] Login page + JWT storage/refresh                       | Success → dashboard; silent refresh                                      | 63, 14     |
| 65  | TODO   | [FE] Protected-route redirect guard                         | Unauthed redirects; authed passes                                        | 64         |
| 66  | TODO   | [FE] Tenant list + create UI                                | Create reflects API; slug conflict surfaced                              | 65, 20     |
| 67  | TODO   | [FE] Tenant detail/edit/suspend UI                          | Persists; status reflected                                               | 66, 23     |
| 68  | TODO   | [FE] Bot list + create UI                                   | Create works; validation shown                                           | 65, 29     |
| 69  | TODO   | [FE] Bot config editor (text)                               | Save persists; invalid provider blocked                                  | 68, 31     |
| 70  | TODO   | [FE] Bot voice config editor                                | STT/TTS/voiceId from enum; save persists                                 | 68, 32     |
| 71  | TODO   | [FE] API-key issue UI (show-once)                           | Raw shown once + copy; then masked                                       | 65, 25     |
| 72  | TODO   | [FE] API-key list + revoke/scopes UI                        | Revoke disables; updates reflect                                         | 71, 26     |
| 73  | TODO   | [FE] Knowledge doc upload UI                                | Progress shown; unsupported type rejected                                | 65, 35     |
| 74  | TODO   | [FE] Knowledge doc list/delete UI                           | Delete removes row + content                                             | 73, 38     |
| 75  | TODO   | [FE] Conversation list + filters                            | Filter date/channel; empty state                                         | 65, 39     |
| 76  | TODO   | [FE] Transcript viewer (text + voice)                       | Both channels render with roles                                          | 75, 53     |
| 77  | TODO   | [FE] Usage dashboard (charts)                               | Matches backend rollups; over-limit highlighted                          | 65, 79     |
| 78  | TODO   | [FE] Billing/invoice view                                   | Totals match invoices                                                    | 77, 84     |
| 79  | TODO   | [Logic] Usage rollup job                                    | Idempotent; rerun no double-count                                        | 18, 3      |
| 80  | TODO   | [API] Plan CRUD                                             | 201; 400 invalid limits                                                  | 17, 2      |
| 81  | TODO   | [API] Assign/update subscription                            | 200; 404 unknown tenant/plan                                             | 80, 20     |
| 82  | TODO   | [Logic] Subscription limit lookup for rate-limit            | Reflects active plan; no sub → default                                   | 81, 19     |
| 83  | TODO   | [Logic] Invoice generation from rollups                     | Totals correct; empty period → zero                                      | 79, 81, 4  |
| 84  | TODO   | [API] Invoice/usage report endpoint                         | 200; empty → []                                                          | 83         |
| 85  | TODO   | [Infra] Per-tenant structured logging                       | Logs carry tenantId/keyId                                                | 10         |
| 86  | TODO   | [Infra] Secret-scan guard                                   | No raw key/hash/password in logs/responses                               | 85         |
| 87  | TODO   | [Infra] Prod docker-compose profile                         | Clean boot from scratch                                                  | —          |
| 88  | TODO   | [Infra] CD migration step                                   | `prisma migrate deploy` runs in pipeline                                 | 87         |
| 89  | TODO   | [Infra] Env validation for new vars                         | Fail-fast on missing JWT/billing/voice vars                              | —          |
| 90  | TODO   | [Docs] OpenAPI spec (public + admin)                        | Spec validates; covers all endpoints                                     | 84, 48     |
| 91  | TODO   | [Docs] Embed + API-key integration quickstart               | Sample works against running server                                      | 61, 90     |

---

## Subtask Details

### Epic A — DB extensions

#### #1 — [DB] `AdminSession` refresh-token model + migration

**Acceptance Criteria:**

- [ ] Model fields: `id, adminUserId FK, tokenHash, userAgent?, expiresAt, revokedAt?, createdAt`
- [ ] `prisma validate` + `prisma generate` pass; migration applies cleanly
- [ ] Deleting an `AdminUser` cascades its sessions
- [ ] Index on `tokenHash`

**Depends on:** —

#### #2 — [DB] `Plan` + `Subscription` models + migration

**Acceptance Criteria:**

- [ ] `Plan(id, name, monthlyPrice, maxRequests, maxVoiceMinutes, ...)`
- [ ] `Subscription(id, tenantId FK, planId FK, status, periodStart, periodEnd)`
- [ ] Migration applies; FKs indexed; tenant delete cascades subscription

**Depends on:** —

#### #3 — [DB] `UsageRollup` model + migration

**Acceptance Criteria:**

- [ ] `id, tenantId FK, periodStart, periodEnd, requestCount, voiceMinutes, createdAt`
- [ ] Unique constraint `(tenantId, periodStart)` enforced (rerun-safe)
- [ ] Migration applies cleanly

**Depends on:** —

#### #4 — [DB] `Invoice` + `InvoiceLineItem` models + migration

**Acceptance Criteria:**

- [ ] `Invoice(id, tenantId, periodStart, periodEnd, total, status)` + line items FK
- [ ] Cascade invoice → line items
- [ ] Migration applies cleanly

**Depends on:** #2, #3

#### #5 — [DB] Extend `Provider` enum for voice providers + migration

**Acceptance Criteria:**

- [ ] Add voice providers used by livekit-agent (e.g. DEEPGRAM, ELEVEN, CARTESIA, GOOGLE…)
- [ ] Additive change; existing rows unaffected; `prisma validate` passes

**Depends on:** —

#### #6 — [DB] Add voice config fields to `Bot` + migration

**Acceptance Criteria:**

- [ ] Add `voiceEnabled bool @default(false)`, `sttProvider?`, `ttsProvider?`, `voiceId?`
- [ ] Existing bots remain text-only after migration

**Depends on:** #5

---

### Epic B — API-key auth & tenant isolation

#### #7 — [Logic] Key generation + hashing utility

**Acceptance Criteria:**

- [ ] `generateKey()` → `{ raw, keyHash, keyPrefix }`; raw is high-entropy; prefix = first 8 chars
- [ ] Raw key never persisted or logged

**Depends on:** —

#### #8 — [Logic] Key verification (lookup-by-hash)

**Acceptance Criteria:**

- [x] `verifyKey(raw)` hashes input and finds active `ApiKey`
- [x] Returns null for unknown / expired / revoked keys; constant-time-safe compare

**Depends on:** #7

#### #9 — [API] API-key auth middleware (parse + load)

**Acceptance Criteria:**

- [ ] Reads `Authorization: Bearer <key>`; attaches `req.apiKey` on success
- [ ] **401** for missing / malformed / unknown key

**Depends on:** #8

#### #10 — [API] Tenant context + scope enforcement

**Acceptance Criteria:**

- [ ] Injects `req.tenantId` + scopes; checks required scope per route
- [ ] **403** on insufficient scope (e.g. CHAT-only key on admin route)

**Depends on:** #9

#### #11 — [API] Per-bot key binding enforcement

**Acceptance Criteria:**

- [ ] If `apiKey.botId` set, requests for other bots → **403**
- [ ] Null binding grants access to all tenant bots

**Depends on:** #10

#### #12 — [Logic] Update `lastUsedAt` on successful auth

**Acceptance Criteria:**

- [ ] Successful auth updates `lastUsedAt` (throttled, async, non-blocking)
- [ ] Request latency unaffected

**Depends on:** #9

#### #13 — [Logic] Password hash/verify utility

**Acceptance Criteria:**

- [ ] `hash(pw)` + `verify(pw, hash)` via argon2/bcrypt; round-trip verifies
- [ ] Wrong password fails verification

**Depends on:** —

#### #14 — [API] `POST /admin/auth/login`

**Acceptance Criteria:**

- [ ] Req `{email, password}` → **200** `{accessToken, refreshToken, admin}`; persists refresh (#1)
- [ ] **401** bad creds; **403** `isActive=false`; sets `lastLoginAt`

**Depends on:** #1, #13

#### #15 — [API] `POST /admin/auth/refresh`

**Acceptance Criteria:**

- [ ] Req `{refreshToken}` → **200** new access + rotated refresh; old refresh revoked
- [ ] **401** unknown / expired / reused token

**Depends on:** #14

#### #16 — [API] `POST /admin/auth/logout`

**Acceptance Criteria:**

- [ ] Revokes presented refresh token; **204** on success
- [ ] Subsequent refresh with revoked token → **401**

**Depends on:** #14

#### #17 — [API] Admin auth-guard middleware

**Acceptance Criteria:**

- [ ] Verifies access JWT + `isAdmin` + `isActive`; attaches `req.admin`
- [ ] **401** missing/expired token; **403** non-admin/inactive

**Depends on:** #14

#### #18 — [Logic] Usage counter increment

**Acceptance Criteria:**

- [ ] Atomic upsert of `ApiKeyUsage(apiKeyId, windowStart)` with `requestCount += 1`
- [ ] Concurrent requests counted correctly (no lost updates)

**Depends on:** #9

#### #19 — [API] Rate-limit middleware

**Acceptance Criteria:**

- [ ] Enforces per-key/plan window limit; under limit passes
- [ ] **429** with `Retry-After` / `X-RateLimit-Remaining` when exceeded

**Depends on:** #18, #2

---

### Epic C — Tenant / Key / Bot / Document APIs

#### #20 — [API] `POST /admin/tenants`

**Acceptance Criteria:**

- [ ] Req `{name, slug}` → **201** `{tenant}`
- [ ] **409** duplicate slug; **400** invalid slug

**Depends on:** #17

#### #21 — [API] `GET /admin/tenants`

**Acceptance Criteria:**

- [ ] Paginated `?page&limit&search` → **200** `{items, total}`
- [ ] Empty result → `[]`

**Depends on:** #17

#### #22 — [API] `GET /admin/tenants/:id`

**Acceptance Criteria:**

- [ ] **200** `{tenant}` with related counts; **404** unknown id

**Depends on:** #17

#### #23 — [API] `PATCH /admin/tenants/:id`

**Acceptance Criteria:**

- [ ] Update name/status → **200** updated
- [ ] **409** slug conflict; **404** unknown

**Depends on:** #20

#### #24 — [API] `DELETE /admin/tenants/:id`

**Acceptance Criteria:**

- [ ] Soft-archive (status=ARCHIVED) or hard-delete (cascades) → **204**; **404** unknown
- [ ] Archived tenant's keys stop authenticating

**Depends on:** #20

#### #25 — [API] `POST /admin/tenants/:id/keys`

**Acceptance Criteria:**

- [ ] Req `{name, scopes[], expiresAt?, botId?}` → **201** `{rawKey, keyPrefix}` (raw shown once)
- [ ] **400** invalid scope; **404** unknown tenant/bot

**Depends on:** #17, #7, #20

#### #26 — [API] `GET /admin/tenants/:id/keys`

**Acceptance Criteria:**

- [ ] Lists keys (prefix, scopes, status, lastUsedAt) — never raw/hash
- [ ] Empty → `[]`

**Depends on:** #17, #20

#### #27 — [API] `PATCH /admin/keys/:keyId`

**Acceptance Criteria:**

- [ ] Update scopes/expiry/botId → **200**
- [ ] **404** unknown; **400** invalid scope

**Depends on:** #25

#### #28 — [API] `POST /admin/keys/:keyId/revoke`

**Acceptance Criteria:**

- [ ] Sets `revokedAt` + status → **200**; key fails auth afterward
- [ ] **404** unknown

**Depends on:** #25

#### #29 — [API] `POST /admin/tenants/:id/bots`

**Acceptance Criteria:**

- [ ] Req `{name, systemPrompt, provider, model, temperature?, greeting?}` → **201**
- [ ] **400** invalid provider/model; **404** unknown tenant

**Depends on:** #17, #20

#### #30 — [API] `GET` bots (list + detail)

**Acceptance Criteria:**

- [ ] `GET /admin/tenants/:id/bots` + `GET /admin/bots/:botId` → **200**
- [ ] **404** unknown

**Depends on:** #17, #29

#### #31 — [API] `PATCH /admin/bots/:botId` (text config)

**Acceptance Criteria:**

- [ ] Update name/prompt/provider/model/temperature/greeting → **200**
- [ ] **400** invalid provider/model

**Depends on:** #29

#### #32 — [API] `PATCH /admin/bots/:botId/voice`

**Acceptance Criteria:**

- [ ] Update `voiceEnabled, sttProvider, ttsProvider, voiceId` → **200**
- [ ] **400** voice provider not in enum

**Depends on:** #29, #6

#### #33 — [API] `PATCH /admin/bots/:botId/status`

**Acceptance Criteria:**

- [ ] Enable/disable bot → **200**
- [ ] Disabled bot rejects chat & voice requests

**Depends on:** #29

#### #34 — [API] `DELETE /admin/bots/:botId`

**Acceptance Criteria:**

- [ ] Delete bot (guard/handle dependent conversations) → **204**; **404** unknown

**Depends on:** #29

#### #35 — [API] `POST /admin/bots/:botId/documents` (upload)

**Acceptance Criteria:**

- [ ] Multipart upload stores metadata + retrievable content; sets `status` → **201** `{document}`
- [ ] **400** unsupported contentType; **413** oversize

**Depends on:** #17, #29

#### #36 — [API] `GET` documents (list + metadata)

**Acceptance Criteria:**

- [ ] List per bot/tenant + single metadata → **200**
- [ ] Empty → `[]`; **404** unknown

**Depends on:** #17, #35

#### #37 — [API] `GET /admin/documents/:docId/content`

**Acceptance Criteria:**

- [ ] Returns stored content (for tool + UI preview) → **200**
- [ ] **404** unknown; tenant-scoped access only

**Depends on:** #35

#### #38 — [API] `DELETE /admin/documents/:docId`

**Acceptance Criteria:**

- [ ] Removes metadata + stored content → **204**; **404** unknown

**Depends on:** #35

---

### Epic D — Text agent persistence & document tool

#### #39 — [Logic] Upsert `Conversation` by `(tenantId, threadId)`

**Acceptance Criteria:**

- [ ] New threadId creates conversation; existing reused (no duplicate)
- [ ] botId / apiKeyId linked

**Depends on:** #10, #29

#### #40 — [Logic] Append `Message` rows

**Acceptance Criteria:**

- [ ] Persists user + assistant messages (role/content/tokenCount?)
- [ ] Order preserved per turn

**Depends on:** #39

#### #41 — [Logic] Update `lastMessageAt`

**Acceptance Criteria:**

- [ ] Each new message updates conversation `lastMessageAt` to latest timestamp

**Depends on:** #40

#### #42 — [Logic] `EndUser` upsert by `(tenantId, externalId)`

**Acceptance Criteria:**

- [ ] New externalId creates; repeat reuses; null externalId allowed (anonymous)
- [ ] Linked to conversation

**Depends on:** #39

#### #43 — [Logic] Resolve bot in `chat.service.ts`

**Acceptance Criteria:**

- [ ] Resolves bot from key binding/request; correct bot selected
- [ ] Disabled/missing bot → graceful **4xx**

**Depends on:** #11, #29

#### #44 — [Logic] Inject bot config into text agent

**Acceptance Criteria:**

- [ ] Agent uses bot systemPrompt/provider/model/greeting instead of env defaults
- [ ] Per-bot behavior verified

**Depends on:** #43

#### #45 — [Logic] Doc tool — list docs for tenant/bot

**Acceptance Criteria:**

- [ ] Tool returns doc list scoped to tenant + bot
- [ ] Cross-tenant docs excluded

**Depends on:** #37, #44

#### #46 — [Logic] Doc tool — fetch content (scoped guard)

**Acceptance Criteria:**

- [ ] Fetches content by docId; valid returns content
- [ ] Cross-tenant/cross-bot docId refused

**Depends on:** #45

#### #47 — [Logic] Register doc tool with deepagent

**Acceptance Criteria:**

- [ ] Tool registered so text LLM can call it; answers use doc content
- [ ] No docs → graceful empty result

**Depends on:** #46

---

### Epic E — Voice SaaS

#### #48 — [API] Gate `/livekit` token with key auth + VOICE scope

**Acceptance Criteria:**

- [ ] Token issuance requires valid key + VOICE scope + voice-enabled bot → token
- [ ] **403** missing scope / voice disabled

**Depends on:** #10, #33

#### #49 — [Logic] Embed tenantId/botId in room metadata/grants

**Acceptance Criteria:**

- [ ] Token/room carries tenantId + botId; agent can read them from room

**Depends on:** #48

#### #50 — [Logic] Voice agent resolves bot from room metadata

**Acceptance Criteria:**

- [ ] livekit-agent reads metadata → loads bot; correct bot used
- [ ] Missing metadata → safe default + log

**Depends on:** #49, #30

#### #51 — [Logic] Voice agent applies bot LLM/STT/TTS/voice config

**Acceptance Criteria:**

- [ ] Agent uses bot provider/model/sttProvider/ttsProvider/voiceId
- [ ] Applied config verified

**Depends on:** #50, #6

#### #52 — [Logic] Persist voice `Conversation` (channel=VOICE)

**Acceptance Criteria:**

- [ ] Session start creates conversation (channel=VOICE) linked to bot/endUser/key

**Depends on:** #49, #39

#### #53 — [Logic] Persist transcript `Message`s via webhook

**Acceptance Criteria:**

- [ ] `/webhook` writes transcript turns as messages with roles

**Depends on:** #52

#### #54 — [Logic] Flush partial transcript on call end/drop

**Acceptance Criteria:**

- [ ] Dropped/ended call persists partial transcript + sets conversation status
- [ ] No data loss on abnormal end

**Depends on:** #53

#### #55 — [Logic] Doc-read tool for voice agent

**Acceptance Criteria:**

- [ ] livekit-agent exposes same tenant/bot-scoped doc tool to voice LLM
- [ ] Voice answers from docs; cross-tenant blocked

**Depends on:** #51, #46

#### #56 — [Logic] Voice usage metering

**Acceptance Criteria:**

- [ ] Voice minutes/sessions counted into usage
- [ ] Over-limit denies new rooms (**429** / token denial)

**Depends on:** #54, #19

---

### Epic F — Embeddable widget

#### #57 — [FE] Embeddable widget build target

**Acceptance Criteria:**

- [ ] Separate self-contained bundle (no host CSS/JS leakage); mounts in isolated container

**Depends on:** —

#### #58 — [FE] Widget text chat (key + threadId → /chat)

**Acceptance Criteria:**

- [ ] Sends publishable key + threadId; renders replies; persists threadId
- [ ] Happy path works on a blank host page

**Depends on:** #57, #40

#### #59 — [FE] Widget loading/error/empty states

**Acceptance Criteria:**

- [ ] Loading spinner, invalid-key error, network-error retry
- [ ] Invalid key → clear error, no crash

**Depends on:** #58

#### #60 — [FE] Widget voice mode

**Acceptance Criteria:**

- [ ] Voice toggle connects key-authed LiveKit session
- [ ] Hidden/disabled when bot voice-disabled

**Depends on:** #58, #48

#### #61 — [FE] Embed loader `<script>` snippet

**Acceptance Criteria:**

- [ ] One-line snippet boots widget with data attrs (key, bot)
- [ ] Bad/missing attrs fail gracefully

**Depends on:** #58

#### #62 — [FE] Widget theming/config from `/config`

**Acceptance Criteria:**

- [ ] Per-tenant theme/greeting applied from config endpoint
- [ ] Default fallback if config missing

**Depends on:** #58

---

### Epic G — Admin portal UI

#### #63 — [FE] Admin app scaffold

**Acceptance Criteria:**

- [ ] Routing, layout shell, auth store; app boots; nav renders

**Depends on:** —

#### #64 — [FE] Login page + JWT storage/refresh

**Acceptance Criteria:**

- [ ] Login form stores tokens; silent refresh on expiry
- [ ] Success → dashboard; bad creds error shown

**Depends on:** #63, #14

#### #65 — [FE] Protected-route redirect guard

**Acceptance Criteria:**

- [ ] Unauthed access redirects to login; authed passes (both verified)

**Depends on:** #64

#### #66 — [FE] Tenant list + create UI

**Acceptance Criteria:**

- [ ] Table + create modal; create reflects API; slug conflict surfaced

**Depends on:** #65, #20

#### #67 — [FE] Tenant detail/edit/suspend UI

**Acceptance Criteria:**

- [ ] Edit form + suspend/archive action; persists; status reflected

**Depends on:** #66, #23

#### #68 — [FE] Bot list + create UI

**Acceptance Criteria:**

- [ ] List + create form; create works; validation errors shown

**Depends on:** #65, #29

#### #69 — [FE] Bot config editor (text)

**Acceptance Criteria:**

- [ ] Edit prompt/provider/model/temperature/greeting + enable toggle
- [ ] Save persists; invalid provider blocked

**Depends on:** #68, #31

#### #70 — [FE] Bot voice config editor

**Acceptance Criteria:**

- [ ] Voice toggle + STT/TTS/voiceId selectors (options from enum); save persists

**Depends on:** #68, #32

#### #71 — [FE] API-key issue UI (show-once)

**Acceptance Criteria:**

- [ ] Issue modal shows raw key once + copy; then masked (never re-displayed)

**Depends on:** #65, #25

#### #72 — [FE] API-key list + revoke/scopes UI

**Acceptance Criteria:**

- [ ] List (prefix/status); revoke; edit scopes/expiry; updates reflect

**Depends on:** #71, #26

#### #73 — [FE] Knowledge doc upload UI

**Acceptance Criteria:**

- [ ] Upload with progress + type validation; unsupported type rejected

**Depends on:** #65, #35

#### #74 — [FE] Knowledge doc list/delete UI

**Acceptance Criteria:**

- [ ] List + delete with confirm; delete removes row + content

**Depends on:** #73, #38

#### #75 — [FE] Conversation list + filters

**Acceptance Criteria:**

- [ ] List per tenant/bot; filter by date/channel; empty state handled

**Depends on:** #65, #39

#### #76 — [FE] Transcript viewer (text + voice)

**Acceptance Criteria:**

- [ ] Thread view with roles; voice transcripts rendered; both channels display

**Depends on:** #75, #53

#### #77 — [FE] Usage dashboard (charts)

**Acceptance Criteria:**

- [ ] Per-tenant usage charts from rollups; numbers match backend; over-limit highlighted

**Depends on:** #65, #79

#### #78 — [FE] Billing/invoice view

**Acceptance Criteria:**

- [ ] Plan, limits, invoice list/detail; totals match invoices

**Depends on:** #77, #84

---

### Epic H — Billing

#### #79 — [Logic] Usage rollup job

**Acceptance Criteria:**

- [ ] Scheduled rollup `ApiKeyUsage` → `UsageRollup` per tenant/period; idempotent
- [ ] Rerun doesn't double-count; no-usage → zero rollup, no crash

**Depends on:** #18, #3

#### #80 — [API] Plan CRUD

**Acceptance Criteria:**

- [ ] `POST/GET/PATCH/DELETE /admin/plans`; create **201**
- [ ] **400** invalid limits

**Depends on:** #17, #2

#### #81 — [API] Assign/update subscription

**Acceptance Criteria:**

- [ ] `POST/PATCH /admin/tenants/:id/subscription` → **200**
- [ ] **404** unknown tenant/plan

**Depends on:** #80, #20

#### #82 — [Logic] Subscription limit lookup for rate-limit

**Acceptance Criteria:**

- [ ] Rate-limit middleware reads tenant's plan limits
- [ ] No subscription → default/free limit

**Depends on:** #81, #19

#### #83 — [Logic] Invoice generation from rollups

**Acceptance Criteria:**

- [ ] Invoice = usage × plan price per period; totals correct
- [ ] Empty period → zero invoice

**Depends on:** #79, #81, #4

#### #84 — [API] Invoice/usage report endpoint

**Acceptance Criteria:**

- [ ] `GET /admin/tenants/:id/invoices` + usage report → **200**
- [ ] Empty → `[]`

**Depends on:** #83

---

### Epic I — Cross-cutting & docs

#### #85 — [Infra] Per-tenant structured logging

**Acceptance Criteria:**

- [ ] Logs/metrics carry tenantId + keyId; traceable per tenant

**Depends on:** #10

#### #86 — [Infra] Secret-scan guard

**Acceptance Criteria:**

- [ ] No raw key / hash / password in logs or API responses; `secret-scanner` clean

**Depends on:** #85

#### #87 — [Infra] Prod docker-compose profile

**Acceptance Criteria:**

- [ ] Prod profile runs server/client/agent/db; clean boot from scratch

**Depends on:** —

#### #88 — [Infra] CD migration step

**Acceptance Criteria:**

- [ ] `prisma migrate deploy` runs in pipeline before app start; migrations apply in CD

**Depends on:** #87

#### #89 — [Infra] Env validation for new vars

**Acceptance Criteria:**

- [ ] Yup schema covers JWT secret, billing, voice provider keys; fail-fast on boot
- [ ] Missing var → clear startup error

**Depends on:** —

#### #90 — [Docs] OpenAPI spec (public + admin)

**Acceptance Criteria:**

- [ ] Spec validates; covers auth, tenants, keys, bots, docs, chat, livekit

**Depends on:** #84, #48

#### #91 — [Docs] Embed + API-key integration quickstart

**Acceptance Criteria:**

- [ ] Step-by-step embed + first API call; sample works against running server

**Depends on:** #61, #90

---

## Suggested Execution Order

```
A (1–6) → B (7–12) / B2 (13–17) / B3 (18–19)
        → C (20–38)
        → D (39–47)
        → E (48–56)  ∥  F (57–62)  ∥  G (63–78)
        → H (79–84)
        → I (85–91)
```

Epics F and G can proceed in parallel with E once their backend dependencies (Epics B–D) are merged. Billing (H) gates the usage/billing UI tickets (#77, #78). Docs (I) come last.
