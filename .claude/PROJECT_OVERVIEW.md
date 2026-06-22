# PROJECT OVERVIEW

---

- **Project Name**: `call-center-agent`
- **Project Description**: `AI-powered call center voice agent monorepo built on LiveKit`
- **Programming Languages**: `TypeScript (ESM, Node >=22)`
- **Frameworks**: `Express 4 (server) · React 18 + Vite 7 (client) · LiveKit Agents 1.4 (voice agent) · LangChain / LangGraph 1.x (deepagent)`
- **Package Managers**: `pnpm >=10 (workspace monorepo)`
- **Key Libraries**: `Prisma 7 · @livekit/agents (+plugins) · livekit-server-sdk · livekit-client · @langchain/* · deepagents · zod · yup · @tanstack/react-query · @tanstack/react-router · jotai · @mui/material · axios · helmet · pino`
- **Database**: `PostgreSQL (via Prisma + @prisma/adapter-pg) · Redis (LiveKit infra)`
- **Doc Directory**: `/docs`
- **Testing Workflow**: `Skip-Testing` <!-- Code-First | Test-First | Skip-Testing -->
- **Playwright Check**: `Ask-User` <!-- Always | None | Ask-User -->

> Note: DO NOT edit the checklist template above.

## Additional Informations

### Monorepo layout (pnpm workspaces: `apps/*`, `packages/*`)

| Workspace            | Name                           | Role                                                                      | Stack                                                                             |
| -------------------- | ------------------------------ | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| `apps/server`        | `server`                       | Express API server (auth, tenant scoping, chat, LiveKit tokens, webhooks) | Express 4, Prisma 7 / PostgreSQL, yup, pino, helmet                               |
| `apps/client`        | `client`                       | React SPA call UI                                                         | React 18, Vite 7, MUI 6, TanStack Query/Router, jotai, formik+yup, livekit-client |
| `apps/livekit-agent` | `livekit-agent`                | LiveKit voice AI agent (STT/LLM/TTS pipeline)                             | @livekit/agents 1.4 + provider plugins, zod, Vitest                               |
| `apps/infra`         | `infra`                        | Self-hosted Docker Compose stack                                          | Docker Compose: LiveKit, PostgreSQL, Redis, nginx, certbot                        |
| `packages/deepagent` | `@call-center-agent/deepagent` | LangChain/LangGraph agent logic (consumed by server)                      | langchain, @langchain/{anthropic,openai,mistralai,langgraph,core}, deepagents     |
| `packages/harness`   | `@call-center-agent/harness`   | Shared adapter/runtime harness (livekit + langchain adapters)             | zod; peer deps on @livekit/agents, langchain                                      |

Dependency direction: `server → deepagent → harness`; `livekit-agent → harness`.

### Data model (Prisma, multi-file schema in `apps/server/prisma/schema/`)

Multi-tenant SaaS chatbot schema split by domain:

- `tenant.prisma` — `Tenant`, `ApiKey`, `ApiKeyUsage` (enums: `TenantStatus`, `ApiKeyStatus`, `ApiKeyScope`)
- `bot.prisma` — `Bot`, `KnowledgeDocument` (enums: `Provider`, `BotStatus`, `DocumentStatus`)
- `conversation.prisma` — `EndUser`, `Conversation`, `Message` (enums: `Channel`, `ConversationStatus`, `MessageRole`)
- `billing.prisma` — `Plan`, `Subscription`, `UsageRollup`, `Invoice`, `InvoiceLineItem` (enums: `BillingInterval`, `SubscriptionStatus`, `InvoiceStatus`)
- `admin.prisma` — `AdminUser`, `AdminSession`
- Migrations live in `apps/server/prisma/migrations/`.

### Common commands

```bash
pnpm install                 # install all workspaces
pnpm copy-env                # scaffold .env files (server, livekit-agent, infra, client)
pnpm infra dev               # start LiveKit + PostgreSQL + Redis
pnpm server dev              # tsx watch src/server.ts
pnpm livekit-agent dev       # build + run voice agent
pnpm client dev              # vite dev server
pnpm format                  # prettier --write .
pnpm <app> lint              # eslint .  (per app)
pnpm <app> typecheck         # tsc --noEmit  (per app)
pnpm server db:migrate       # prisma migrate dev
```

### Tooling notes

- **Knowledge graph (Graphify):** a code graph is built at `graphify-out/graph.json`. Query it before reading source: `graphify query "<question>"`, `graphify path "<A>" "<B>"`, `graphify explain "<concept>"`. Rebuild after edits with `graphify update .`. A `.graphifyignore` excludes docs/config so the build needs no LLM key; community naming + doc/PDF semantic extraction require an LLM API key (not configured).
- **RTK:** registered globally; auto-rewrites Bash commands to compressed equivalents (effective after a Claude Code restart).
