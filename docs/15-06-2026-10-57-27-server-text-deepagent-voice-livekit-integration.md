- Author: Root Agent
- Title: Plan — Unify text (deepagent) + voice (livekit-agent) chat in `apps/server`
- Classification: feature
- Description: Turn `apps/deepagent` into an in-process library and consume it from the existing `apps/server` gateway so one server exposes `POST /chat` (text, via deepagents) alongside the existing `POST /livekit/token` (voice dispatch), following server conventions.

---

## Approach Summary

- The existing `apps/server` already owns the **voice** path (`apps/server/src/services/livekit.service.ts` issues a token + dispatches `LIVEKIT_AGENT_NAME` into the room). We keep it untouched and add the **text** path beside it.
- `apps/deepagent` becomes a **library** (built with `tsup`, like `packages/harness`) exporting a `TextChatService`/factory + `ProviderType`. Its standalone Express server (`main.ts`, `src/server/*`) is retired. The agent factory is parametrized to receive the provider instead of loading its own env, so the host server owns configuration.
- `apps/server` gains a Yup-validated, class-based `chat` controller/service/route that calls the deepagent library and returns `{ threadId, reply }` as JSON — matching deepagent's current contract and the existing server layering (controller → service → util, Pino, `responseHandler`).
- LangChain model classes read `OPENAI_API_KEY`/`MISTRAL_API_KEY`/`ANTHROPIC_API_KEY` from `process.env`, and the harness stock tool reads `TWELVE_DATA_API_KEY`; these move into the server's env surface.

## Functional Requirements

- `POST /chat` with `{ "message": "...", "threadId?": "..." }` returns `200 { "threadId", "reply" }`. Missing/empty `message` → `400`.
- A new conversation (no `threadId`) generates one; passing an existing `threadId` continues it (in-memory `MemorySaver`, lost on restart — unchanged behavior).
- Existing `POST /livekit/token` and `/webhook` / `/health` behavior is unchanged (client contract preserved — no route renaming).
- `deepagent` exposes a typed library API; the standalone deepagent HTTP server no longer exists.

## Non-Functional Requirements

- Follow server conventions: Yup validators, class-based controller/service, Pino logger (no `console.log`), centralized error handler, `http-errors`.
- Respect TypeScript strictness (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`). Hand-written interfaces live in `src/types/*.d.ts` (per project memory); no inline `.js` extensions in imports.
- No secrets committed — `.env.example` keys only, never values.
- Testing is **Skip-Testing** per `PROJECT_OVERVIEW.md`; verification = `typecheck` + `lint` + manual `curl`. No tester sub-agent.

## Files in Scope

**deepagent → library**

- Modify: `apps/deepagent/package.json` (add `exports`, switch build to `tsup`, drop server-only deps: express/http-errors/pino/dotenv/zod), `apps/deepagent/src/agents/index.ts` (`createChatAgent({ provider })`), `apps/deepagent/README.md`, `apps/deepagent/src/types/chat.d.ts` (trim to library types).
- Create: `apps/deepagent/src/index.ts` (library entry: `TextChatService` w/ `chat({message, threadId}) → {threadId, reply}`, re-export `ProviderType`), `apps/deepagent/tsup.config.ts`.
- Keep: `apps/deepagent/src/agents/provider.ts`, `apps/deepagent/src/agents/subagents.ts`.
- Delete: `apps/deepagent/src/main.ts`, `apps/deepagent/src/server/**` (app, controllers, routes, middlewares, configs/env, utils/logger), `apps/deepagent/vite.config.ts`, `apps/deepagent/Dockerfile`, `apps/deepagent/.dockerignore`, `apps/deepagent/.env.example`.

**server → add text chat**

- Modify: `apps/server/package.json` (add `"deepagent": "workspace:*"`), `apps/server/src/configs/env.ts` (add `LLM_PROVIDER` + optional provider/tool keys), `apps/server/src/routes/index.ts` (mount chat router), `apps/server/.env.example`, `apps/server/README.md`.
- Create: `apps/server/src/validators/chat.validator.ts`, `apps/server/src/services/chat.service.ts`, `apps/server/src/controllers/chat.controller.ts`, `apps/server/src/routes/chat.route.ts`, `apps/server/src/types/chat.d.ts`; update `apps/server/src/validators/index.ts` barrel.

## Risks & Assumptions

- **Assumption:** Endpoint stays `POST /chat` (matches deepagent README); voice routes are **not** renamed, to avoid breaking the React client which calls `POST /livekit/token`.
- **Assumption:** Single shared chat-agent instance per server process (lazy singleton in `ChatService`); threads remain in-memory `MemorySaver`. No persistence added.
- **Build order:** `deepagent` (and `harness`) must be built before `server` runs, since the server resolves them via package `exports → dist`. Same established pattern as `harness`.
- **Risk:** Removing deepagent's server deps could miss a transitive use — mitigated by `typecheck`/`lint` gate after the change.
- The deepagent provider factory does not pass API keys explicitly; LangChain reads them from `process.env`, so the selected provider's key must be present in the server's `.env.local` at runtime.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                                                                                                                                                                                                                                                    | Responsible Role | Dependencies | Skills                         |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------------------------ |
| 1   | TODO   | Convert `apps/deepagent` into a `tsup`-built library: parametrize `createChatAgent({ provider })`, add `src/index.ts` exporting `TextChatService.chat()` (HumanMessage build + reply extraction moved from old controller) and `ProviderType`, add `exports` map, delete `main.ts`/`src/server/**`/vite/Dockerfile/.env.example, update README. AC: `pnpm --filter deepagent build && typecheck && lint` pass; library exports resolve.                 | developer        | none         | `clean-code`, `secret-scanner` |
| 2   | TODO   | Integrate text chat into `apps/server`: add `deepagent` workspace dep; extend `configs/env.ts` with `LLM_PROVIDER` + optional keys; add `chat.validator.ts` (Yup), `chat.service.ts` (lazy singleton agent), `chat.controller.ts`, `chat.route.ts`, `types/chat.d.ts`; mount `POST /chat`; update `.env.example` + README. AC: `pnpm --filter server typecheck && lint` pass; `POST /chat {message}` → `{threadId, reply}`; `/livekit/token` unchanged. | developer        | task 1       | `clean-code`, `secret-scanner` |
