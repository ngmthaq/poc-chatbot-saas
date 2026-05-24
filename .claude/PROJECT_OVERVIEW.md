# PROJECT OVERVIEW

---

- **Project Name**: `call-center-agent`
- **Project Description**: `Call center AI agent monorepo — a voice AI platform built on LiveKit, consisting of an AI agent, an API server, a React frontend, and a Docker-based infrastructure stack.`
- **Programming Languages**: `TypeScript (all apps)`
- **Frameworks**: `React 18 + Vite (client) | Express.js (server) | Vite + Node.js (agent) | Docker Compose (infra)`
- **Package Managers**: `pnpm 10.25.0`
- **Key Libraries**: `See per-app breakdown below`
- **Database**: `PostgreSQL 16 (app DB) · Redis 7 (app cache/queue) · Redis (LiveKit message bus) — all via Docker Compose`
- **Doc Directory**: `docs/`
- **Testing Workflow**: `Skip-Testing` <!-- Code-First | Test-First | Skip-Testing -->
- **Playwright Check**: `Ask-User` <!-- Always | None | Ask-User -->

> Note: DO NOT edit the checklist template above.

## Additional Informations

### Monorepo Structure

This is a **pnpm workspace monorepo** managed at the root. All apps live under `apps/`.

| App              | Path                  | Role                                                                  |
| ---------------- | --------------------- | --------------------------------------------------------------------- |
| `livekit-agent`  | `apps/livekit-agent`  | LiveKit AI voice agent (TypeScript, built with Vite, runs on Node.js) |
| `livekit-server` | `apps/livekit-server` | Express.js REST API + webhook server (TypeScript, compiled with tsc)  |
| `livekit-client` | `apps/livekit-client` | React 18 frontend with Vite (TypeScript)                              |
| `livekit-infra`  | `apps/livekit-infra`  | Docker Compose stack for local dev and production infrastructure      |

### Per-App Key Libraries

**`livekit-agent`**

- `@livekit/agents` ^1.4.3 — core LiveKit Agents SDK
- `@livekit/agents-plugin-*` — STT/TTS/LLM provider plugins (Cartesia, Deepgram, ElevenLabs, OpenAI, Google, Mistral, xAI, etc.)
- `@livekit/noise-cancellation-node` — noise cancellation
- `zod` — runtime validation
- `dotenv` — environment loading
- Build: `vite`, Test: `vitest`

**`livekit-server`**

- `express` — HTTP framework
- `livekit-server-sdk` ^2.15.3 — token generation + webhook handling
- `cors`, `helmet`, `morgan` — security and logging middleware
- `zod` — request validation
- `humps` — camelCase/snake_case conversion
- Dev: `tsx` for hot reload, `tsc` for production build

**`livekit-client`**

- `react` ^18.3.1 + `react-dom` — UI framework
- `@livekit/components-react`, `livekit-client` — LiveKit room and participant components
- `@tanstack/react-router` — file-based routing
- `@tanstack/react-query` — server state management
- `@mui/material` + `@emotion/react/styled` — component library
- `jotai` — client-side state management (atoms)
- `axios` — HTTP client
- Build: `vite`

**`livekit-infra`**

- Docker Compose profiles: `dev` (bridge network, cross-platform) and `prod` (host network, Linux)
- Services: nginx (SNI passthrough), LiveKit server, Redis (LiveKit bus), PostgreSQL 16, Redis (app cache)

### Infrastructure Notes

- **PostgreSQL**: app database, exposed on `127.0.0.1:5432`
- **Redis (LiveKit)**: dedicated message bus for LiveKit clustering
- **Redis (App)**: application-level cache and queue, default port `6380`
- **Nginx**: TLS termination + reverse proxy (prod only); uses Let's Encrypt via Certbot
- **Environment**: each app has `.env.example` and `.env.local` files; secrets are never committed

### Root Tooling

- `husky` — git hooks (lint-staged runs on pre-commit)
- `prettier` + `@trivago/prettier-plugin-sort-imports` — code formatting
- `eslint` + `typescript-eslint` — linting (configured per app)
- Node.js ≥ 22 required; pnpm ≥ 10 required
