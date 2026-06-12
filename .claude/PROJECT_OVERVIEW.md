# PROJECT OVERVIEW

---

- **Project Name**: `call-center-agent`
- **Project Description**: `Call center AI agent monorepo — a voice AI system using LiveKit that connects a React client, Express.js backend, and an LLM-powered voice agent.`
- **Programming Languages**: `TypeScript`
- **Frameworks**: `React 18 (client), Vite (client + livekit-agent), Express.js (server), @livekit/agents (livekit-agent), Docker Compose + Nginx (infra)`
- **Package Managers**: `pnpm@10.25.0 (workspace monorepo)`
- **Key Libraries**: `@livekit/agents, @livekit/agents-plugin-* (mistralai, openai, google, deepgram, elevenlabs, cartesia, etc.), livekit-server-sdk, livekit-client, @livekit/components-react, express, axios, @tanstack/react-query, @tanstack/react-router, jotai, zod, pino, humps, @mui/material, @emotion/react`
- **Database**: `None`
- **Doc Directory**: `docs/`
- **Testing Workflow**: `Skip-Testing` <!-- Code-First | Test-First | Skip-Testing -->
- **Playwright Check**: `None` <!-- Always | None | Ask-User -->

> Note: DO NOT edit the checklist template above.

## Additional Information

### Monorepo Structure

```
call-center-agent/
├── apps/
│   ├── livekit-agent/     Voice AI agent — extends voice.Agent, uses LLM/STT/TTS provider factory
│   ├── client/            React SPA — connects to LiveKit room, renders call UI
│   ├── server/            Express.js API — issues LiveKit tokens, handles webhooks
│   └── infra/             Docker Compose stack — LiveKit server, PostgreSQL, Redis, Nginx
├── docs/                  Agent-generated plans and decision docs
├── scripts/               Shell utility scripts (e.g., copy-env.sh)
└── .claude/               AI agent configuration (skills, rules, conventions)
```

### App Responsibilities

| App             | Purpose                                     | Key Tech                                       |
| --------------- | ------------------------------------------- | ---------------------------------------------- |
| `livekit-agent` | Voice AI pipeline (LLM + STT + TTS)         | @livekit/agents, Vite, vitest                  |
| `client`        | Browser call UI (join, talk, transcription) | React, Vite, MUI, TanStack Router/Query, Jotai |
| `server`        | Token generation & webhook handler          | Express.js, livekit-server-sdk, Pino, Yup      |
| `infra`         | Self-hosted LiveKit infrastructure          | Docker Compose, Nginx, PostgreSQL, Redis       |

### Environment Variables

Each app has `.env.example` and `.env.local`. The root `copy-env` script copies examples to locals.

- `server`: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL`, `LIVEKIT_AGENT_NAME`, `PORT`
- `livekit-agent`: LiveKit connection + AI provider API keys (OpenAI, Mistral, Deepgram, etc.)
- `client`: `VITE_API_BASE_URL` (Express server base URL), `VITE_LIVEKIT_URL` (LiveKit WebSocket URL, e.g. `ws://localhost:7880`)
- `infra`: LiveKit server config, port bindings, domain settings

### Workspace Scripts

Run per-app commands via root pnpm scripts:

```sh
pnpm server <cmd>    # e.g., pnpm server dev
pnpm client <cmd>
pnpm livekit-agent <cmd>
pnpm infra <cmd>
```
