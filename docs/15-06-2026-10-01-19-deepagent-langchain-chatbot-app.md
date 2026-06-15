- Author: Root Agent
- Title: Plan — DeepAgent + LangChain text chatbot app (mirrors `livekit-agent`)
- Classification: feature
- Description: Add a standalone `apps/deepagent` Express app that serves a text chatbot built with `deepagents` + LangChain v1, consuming the shared `@call-center-agent/harness` (LangChain tool adapter + a new text-mode instructions variant), with a multi-provider LLM factory and in-memory threaded conversations.

---

## Approach Summary

- Mirror `livekit-agent`'s thin-app shape (`src/agents/*`, `src/main.ts`, `src/types`, plus config files) but swap the LiveKit voice pipeline for a `deepagents` deep agent and an Express HTTP surface, following `apps/server`'s class-based controller/route/middleware/config conventions for the HTTP layer.
- The agent reuses the harness's framework-agnostic tools via the **existing** `toLangChainTools(toolRegistry)` adapter — so the harness tools' zod version stays internal to each wrapped LangChain tool and never leaks to `deepagents`.
- Because the shared `AgentInstructions` is voice-specific, add a `mode: 'voice' | 'text'` option to it (default `'voice'`, so `livekit-agent` is unchanged) and a text output-rules section for the chatbot.
- Conversations are remembered in-process via a LangGraph `MemorySaver` checkpointer keyed by a client-supplied `threadId`; responses are plain JSON.

## Functional Requirements

- `POST /chat` accepts `{ message: string, threadId?: string }` and returns `{ threadId: string, reply: string }`. If `threadId` is omitted, the server generates one and returns it; reusing it continues the same conversation.
- `GET /health` returns a basic liveness JSON.
- The deep agent is built with `deepagents.createDeepAgent`, configured with the harness tools, the text instructions, **and** sub-agents (a market/finance research sub-agent and a branch-information sub-agent).
- The LLM provider is selectable via a `provider.ts` factory (`ProviderType` enum → `ChatOpenAI` / `ChatMistralAI` / `ChatAnthropic`), default chosen by an `LLM_PROVIDER` env var (default `OPENAI`).
- `pnpm deepagent <cmd>` works from the repo root; `pnpm copy-env` provisions the app's `.env.local`.

## Non-Functional Requirements

- TypeScript strict settings and Prettier/ESLint config identical to the other apps; passes `typecheck` and `lint`.
- No secrets committed (`.env.example` has empty values only); env validated at startup (throws on missing required keys).
- Pino structured logging (no `console.log` in server code); centralized error-handler middleware; no silent failures.
- LangChain consumers must not pull in LiveKit (preserve the harness's optional-peer separation).

## Files in Scope

**Create — `apps/deepagent/`:**

- `package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.ts`, `.nvmrc`, `.gitignore`, `.dockerignore`, `.env.example`, `Dockerfile`, `README.md`
- `src/main.ts` — bootstrap (load env, build agent, start Express)
- `src/agents/provider.ts` — `ProviderType` enum + LLM registry + `providerFactory`
- `src/agents/subagents.ts` — `deepagents` sub-agent definitions (research + branch)
- `src/agents/index.ts` — `createChatAgent()` (`createDeepAgent` + harness tools + text instructions + sub-agents + `MemorySaver`)
- `src/server/app.ts`, `src/server/configs/env.ts`, `src/server/utils/logger.utils.ts`, `src/server/middlewares/error-handler.middleware.ts`, `src/server/controllers/chat.controller.ts`, `src/server/routes/chat.route.ts`
- `src/types/chat.d.ts` — request/response + local types

**Modify:**

- `packages/harness/src/instructions/instructions.ts` — add `mode` option + text output rules
- `packages/harness/src/types/*.d.ts` — add instructions-options type (per harness convention)
- `package.json` (root) — add `"deepagent": "pnpm --filter deepagent $*"`
- `scripts/copy-env.sh` — copy `apps/deepagent/.env.example` → `.env.local`

> Note: `packages/harness` will be rebuilt (`tsup`) so `apps/deepagent` resolves the new export; `pnpm-lock.yaml` will change from the new deps.

## Risks & Assumptions

- **Assumption:** the two proposed sub-agents are: **research** (`getWeather`, `getCoinPrice`, `getGoldPrice`, `getStockPrice`, `convertCurrency`) and **branch** (`searchBranchInformation`).
- **Assumption:** env validation uses **zod** (already in the dependency tree via LangChain) rather than `apps/server`'s `yup`, to avoid adding a dependency. Deliberate minor deviation.
- **Assumption:** default model IDs `gpt-4o-mini` (OpenAI), `mistral-small-latest` (Mistral), a current Claude model (Anthropic) — overridable by env later.
- **Risk (low):** `deepagents@1.10.2` exact option names (`subagents`, `checkpointer`, `instructions` vs `systemPrompt`) must be verified against the installed version; the developer verifies the API rather than assuming.
- **Risk (low):** zod v3 (harness) vs v4 (deepagents) — mitigated by passing **pre-wrapped LangChain tools** across the boundary; developer confirms `typecheck` is clean.
- **Risk (low):** Vite SSR build must externalize `express`/`langgraph`/provider SDKs (mirror `livekit-agent`'s ssr config); developer confirms `build` + `node dist/main.js` boots.
- In-memory threads are lost on restart (per the user's "in-memory threads" choice) — acceptable, noted in the README.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status  | Task                                                                                                                                                                                                                                               | Responsible Role | Dependencies | Skills                           |
| --- | ------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE    | Harness: add `mode: 'voice' \| 'text'` to `AgentInstructions` (default `voice`, voice output unchanged) + text output-rules section + options type in `src/types`; rebuild harness (`tsup`) so the new export resolves                             | developer        | none         | `clean-code`                     |
| 2   | DONE    | `apps/deepagent` config scaffold: `package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.ts`, `.nvmrc`, `.gitignore`, `.dockerignore`, `.env.example`, `Dockerfile`, `README.md` mirroring `livekit-agent`/`server`                     | developer        | 1            | `clean-code`, `secret-scanner`   |
| 3   | DONE    | `src/agents/provider.ts`: `ProviderType` enum + LLM registry (OpenAI/Mistral/Anthropic) + `providerFactory.llm`                                                                                                                                    | developer        | 2            | `clean-code`                     |
| 4   | DONE    | `src/agents/subagents.ts`: define research + branch sub-agents from harness tools                                                                                                                                                                  | developer        | 2            | `clean-code`                     |
| 5   | DONE    | `src/agents/index.ts`: `createChatAgent()` via `createDeepAgent` with `toLangChainTools(toolRegistry)`, text `AgentInstructions`, sub-agents, `MemorySaver`                                                                                        | developer        | 1,3,4        | `clean-code`                     |
| 6   | DONE    | Server layer: `configs/env.ts` (zod-validated), `utils/logger.utils.ts` (pino), `middlewares/error-handler.middleware.ts`, `controllers/chat.controller.ts`, `routes/chat.route.ts`, `app.ts`; `POST /chat` + `GET /health`; `src/types/chat.d.ts` | developer        | 2,5          | `clean-code`, `security-scanner` |
| 7   | DONE    | `src/main.ts`: bootstrap — dotenv `.env.local`, build agent, start Express on `PORT`                                                                                                                                                               | developer        | 5,6          | `clean-code`                     |
| 8   | DONE    | Root wiring: add `deepagent` filter script to root `package.json`; extend `scripts/copy-env.sh`                                                                                                                                                    | developer        | 2            | `clean-code`                     |
| 9   | SKIPPED | Tests — skipped: project Testing Workflow is `Skip-Testing`                                                                                                                                                                                        | tester           | —            | `aaa-testing`                    |

> **Execution outcome (Root Agent):** All developer tasks complete and accepted. Two review cycles fixed: (1) HIGH — `.env.local` ignored due to memoized `loadEnv()` running at import time before `dotenv.config()`; fixed by moving `dotenv.config()` into `configs/env.ts` module top. (2) MEDIUM — `eslint .` linted `dist/`; fixed with a global `{ ignores: ['dist'] }`. Final: deepagent typecheck/lint/build pass, harness rebuilds, livekit-agent unaffected. Boot verified on default 3100 and `.env.local` override 4123 (`LLM_PROVIDER` honored). Live `POST /chat` round-trip not exercised (needs a real provider API key).

> Delegation order: Developer A = Task 1 (harness, isolated scope), then Developer B = Tasks 2–8 (`apps/deepagent` + root wiring). Sequential because the app imports the rebuilt harness. Root Agent reviews against this plan and runs secret/security scans before reporting.
