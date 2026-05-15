# agent-worker

Standalone Node + TypeScript worker built on [`@livekit/agents`](https://docs.livekit.io/agents) v1.x. It registers an entrypoint under an explicit `agentName` so the sibling `backend-service` is the only place that decides when this worker joins a room (via `AgentDispatchClient.createDispatch`).

This scaffold is intentionally provider-agnostic. No STT / TTS / LLM provider is wired here; the entrypoint is a no-op that logs participant join and leave events and exits cleanly when the job ends.

## Layout

```
agent-worker/
  src/
    config.ts   # loads + validates process.env
    logger.ts   # Pino logger factory
    agent.ts    # defineAgent({ entry })  -- default export
    main.ts     # cli.runApp(new ServerOptions({ agent: <agent.ts>, agentName, ... }))
  package.json
  tsconfig.json
  jest.config.cjs
  .eslintrc.cjs
  .prettierrc
  .env.example
  .gitignore
```

## Required environment variables

| Key                  | Required | Description                                                                 |
| -------------------- | -------- | --------------------------------------------------------------------------- |
| `LIVEKIT_URL`        | yes      | WebSocket URL of the LiveKit server (e.g. `ws://localhost:7880` for local). |
| `LIVEKIT_API_KEY`    | yes      | LiveKit API key.                                                            |
| `LIVEKIT_API_SECRET` | yes      | LiveKit API secret. Never commit.                                           |
| `AGENT_NAME`         | yes      | Dispatch name. Setting it enables explicit dispatch.                        |
| `LOG_LEVEL`          | no       | Pino log level. Defaults to `info`.                                         |

Copy `.env.example` to `.env` and fill in real values (do not commit `.env`).

## Local development against `../livekit-server`

1. Start the sibling LiveKit dev server (see `../livekit-server/README.md`). It listens on `ws://localhost:7880` by default.
2. From this directory:
   ```bash
   npm install
   cp .env.example .env
   # edit .env: LIVEKIT_URL=ws://localhost:7880, set API key/secret to your local dev creds,
   # AGENT_NAME=voice-agent (or whichever name backend-service is configured to dispatch).
   npm run dev
   ```
3. The worker connects to the LiveKit server, registers under `AGENT_NAME`, and waits for explicit dispatch.

## How backend-service dispatches this worker

Backend-service holds the LiveKit API credentials and is the control plane for telephony, web, and supervisor flows. It calls `AgentDispatchClient.createDispatch(roomName, agentName, { metadata })` from its global `LiveKitDispatchService`. The value passed for `agentName` must match the `AGENT_NAME` env var that this worker is started with — otherwise no dispatch is delivered.

Because `agentName` is non-empty, automatic dispatch is disabled (see the [LiveKit agent-dispatch docs](https://docs.livekit.io/agents/server/agent-dispatch/#explicit)). The worker will only ever be assigned to rooms that backend-service explicitly dispatches it to.

## Production

```bash
npm run build
npm run start
```

`npm run start` runs the compiled `dist/main.js` in `start` (production) mode of the `@livekit/agents` CLI. Set `LIVEKIT_LOG_LEVEL` or the `LOG_LEVEL` env var to tune verbosity.

## Notes

- This package is a standalone Node application at the workspace root. It is not part of a monorepo (no workspaces).
- Module system: ESM (`"type": "module"`). `@livekit/agents` v1.x ships as ESM and the documented `cli.runApp` pattern uses `import.meta.url` via `fileURLToPath`.
- Engines: Node `>=20`.
