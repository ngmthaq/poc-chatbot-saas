- Author: Root Agent
- Title: Plan — Database schema for multi-tenant SaaS chatbot + admin portal
- Classification: feature
- Description: Design a greenfield Prisma 7 data model (per-domain `*.prisma` files + one initial migration) for a multi-tenant, embeddable SaaS chatbot with a platform admin portal — covering platform admins, tenants, scoped/hashable API keys with usage tracking, bot config & knowledge base, end-users, and persisted conversations/messages. **Schema design only — no application wiring.**

---

## Approach Summary

- Build on the **existing, empty** Prisma 7 plumbing in `apps/server` (datasource/generator in `schema.prisma`, runtime via `@prisma/adapter-pg`). Replace the placeholder `models.prisma` with **per-domain model files** following the documented convention (`admin.prisma`, `tenant.prisma`, `bot.prisma`, `conversation.prisma`).
- **Tenancy model = platform super-admin + per-tenant data.** `AdminUser` is platform-global (with a simple `isAdmin` boolean flag, no RBAC, no per-tenant member accounts). Every customer-owned entity (API keys, bots, knowledge docs, end-users, conversations) carries a `tenantId` FK.
- **API keys** store only a hash + display prefix, support revocation/expiry, `lastUsedAt`, optional per-bot binding, permission scopes, and windowed usage counters for rate-limiting/billing.
- **Conversations & messages tables are defined now**, mapped to the existing client-supplied `threadId` concept — but wiring `chat.service.ts`/deepagent to write to them is explicitly a **follow-up task**, not this one.
- One authoring task (cohesive — relations cross every file) followed by a validate/generate/migration task. Testing tasks are **skipped** (project Testing Workflow = `Skip-Testing`); verification is `prisma validate` + `prisma generate` + migration generation.

## Functional Requirements

- Per-domain `*.prisma` files define these models with correct relations, indexes, and enums:
  - **`AdminUser`** — `id`, `email` (unique), `passwordHash`, `name`, `isAdmin` (bool), `isActive`, `lastLoginAt?`, timestamps.
  - **`Tenant`** — `id`, `name`, `slug` (unique), `status` enum, timestamps. Owns all customer data.
  - **`ApiKey`** — `id`, `tenantId` FK, `name`, `keyHash` (unique), `keyPrefix`, `scopes` (enum array), `status` enum, `expiresAt?`, `lastUsedAt?`, `revokedAt?`, `botId?` FK (per-bot binding; null = all tenant bots), timestamps.
  - **`ApiKeyUsage`** — `id`, `apiKeyId` FK, `windowStart`, `requestCount` (windowed counters for rate-limit/billing); unique `(apiKeyId, windowStart)`.
  - **`Bot`** — `id`, `tenantId` FK, `name`, `description?`, `systemPrompt`, `provider` enum, `model`, `temperature?`, `greeting?`, `status` enum, `isEnabled`, timestamps.
  - **`KnowledgeDocument`** — `id`, `tenantId` FK, `botId?` FK, `title`, `sourceUrl?`, `contentType`, `status` enum, timestamps. (Metadata only — see assumptions.)
  - **`EndUser`** — `id`, `tenantId` FK, `externalId?`, `displayName?`, `metadata` Json, timestamps; unique `(tenantId, externalId)`.
  - **`Conversation`** — `id`, `tenantId` FK, `botId` FK, `endUserId?` FK, `apiKeyId?` FK, `threadId`, `channel` enum (TEXT/VOICE), `title?`, `status` enum, `startedAt`, `lastMessageAt?`, timestamps; unique `(tenantId, threadId)`.
  - **`Message`** — `id`, `conversationId` FK, `role` enum (USER/ASSISTANT/SYSTEM/TOOL), `content`, `tokenCount?`, `toolName?`, `metadata` Json, `createdAt`; index `(conversationId, createdAt)`.
- Enums: `TenantStatus`, `ApiKeyStatus`, `ApiKeyScope`, `Provider`, `BotStatus`, `DocumentStatus`, `Channel`, `MessageRole`.
- `prisma validate` and `prisma generate` pass; an initial migration (e.g. `init_chatbot_schema`) is generated.

## Non-Functional Requirements

- Match repo conventions: per-domain Prisma files, multi-file schema, `uuid` PKs with `@default(uuid())`, `@map`/`@@map` to snake_case table/column names if that matches existing convention (developer confirms; default to Prisma camelCase unless a mapping convention exists), `createdAt @default(now())` / `updatedAt @updatedAt`.
- No secrets in schema; `keyHash` only (never raw keys). Cascade rules set deliberately (e.g. deleting a `Tenant` cascades its owned rows; deleting a `Conversation` cascades `Message`s).
- Indexes on all FKs and common query paths (`tenantId`, `Conversation.lastMessageAt`, `ApiKey.keyHash`).

## Files in Scope

**Create:**

- `apps/server/prisma/schema/admin.prisma` — `AdminUser` + enums
- `apps/server/prisma/schema/tenant.prisma` — `Tenant`, `ApiKey`, `ApiKeyUsage` + enums
- `apps/server/prisma/schema/bot.prisma` — `Bot`, `KnowledgeDocument` + enums
- `apps/server/prisma/schema/conversation.prisma` — `EndUser`, `Conversation`, `Message` + enums
- `apps/server/prisma/migrations/<timestamp>_init_chatbot_schema/migration.sql` (generated)

**Modify / Remove:**

- `apps/server/prisma/schema/models.prisma` — remove the placeholder (models now live in per-domain files), or repurpose as a domain file. Developer decides per convention.

**Untouched:** `schema.prisma` (datasource/generator already correct), `prisma.config.ts`, `prisma.utils.ts`, all chat/service code.

## Risks & Assumptions

- **Assumption:** `KnowledgeDocument` stores **metadata only** — no chunk/embedding/`pgvector` columns. Vector storage for RAG is a deliberate follow-up (would require the `pgvector` extension + an embeddings table). Flag if you want vectors modeled now.
- **Assumption:** `ApiKey` binds to **at most one** bot via nullable `botId` (null = all tenant bots), rather than a many-to-many. Permission scopes are an enum array (e.g. `CHAT`, `READ`).
- **Assumption:** Admin authentication wiring (sessions/JWT) is out of scope; `passwordHash` field is modeled but no `AdminSession` table unless you want one.
- **Assumption:** `Provider` DB enum mirrors the agent's `ProviderType` values (OPENAI, MISTRAL, ANTHROPIC, GOOGLE…) — developer aligns it with the actual `ProviderType` enum in `apps/livekit-agent`/harness.
- **Risk (medium):** `prisma migrate dev` requires a **live Postgres**. If the infra DB isn't running, the developer uses `prisma migrate dev --create-only` to emit the SQL without applying, and notes that applying it is deferred. Will confirm which path was taken.
- **Risk (low):** Prisma 7 multi-file schema + driver-adapter quirks; developer runs `prisma validate`/`generate` to confirm.

## Open Questions / Blockers

- None — all resolved during brainstorming. (Embeddings/sessions/per-bot-binding handled as stated assumptions above; correct any at this gate.)

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status  | Task                                                                                                                                                                                                                         | Responsible Role | Dependencies | Skills                         |
| --- | ------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------------------------ |
| 1   | TODO    | Author all per-domain model files (`admin/tenant/bot/conversation.prisma`) + enums, relations, indexes, cascade rules; remove/repurpose placeholder `models.prisma`. Align `Provider` enum with the codebase `ProviderType`. | developer        | none         | `clean-code`, `secret-scanner` |
| 2   | TODO    | Run `prisma validate` + `prisma generate`; generate initial migration `init_chatbot_schema` (apply if local Postgres is up, else `--create-only`); report which path was used.                                               | developer        | task 1       | `clean-code`                   |
| 3   | SKIPPED | Tests — skipped: project Testing Workflow is `Skip-Testing`.                                                                                                                                                                 | tester           | —            | `aaa-testing`                  |

> Tasks 1 and 2 run **sequentially by a single developer** — the schema's cross-file relations are one cohesive unit, so parallel authoring would risk inconsistent FKs. No parallelism here.
