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
  eslint.config.mjs
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

## Docker

A standalone single-service compose stack (independent of the `backend-service`
and `livekit-server` stacks). Run everything from `agent-worker/`:

```bash
cp .env.example .env   # then fill in real LIVEKIT_* values
docker compose build
docker compose up
```

A populated `.env` is required first — `docker compose up` will start the
worker with empty credentials and it will fail to register otherwise.

`docker compose down` sends SIGTERM, which tini (PID 1) forwards to Node for a
clean LiveKit worker drain.

There are deliberately **no published ports and no healthcheck**. The worker
opens an OUTBOUND WebSocket to `LIVEKIT_URL` and never listens on a host port,
so there is nothing to publish or probe; worker liveness is tracked
server-side by LiveKit over the agents protocol.

When pointing at a host-side LiveKit dev server, set
`LIVEKIT_URL=ws://host.docker.internal:7880` — this is the recommended default
for Docker Desktop (macOS/Windows). `ws://localhost:7880` does NOT work from
inside the worker container because `localhost` resolves to the container
itself, not the host. On Linux, either use the same `host.docker.internal`
form (Docker 20.10+ exposes it via `--add-host`) or attach the worker to the
`livekit-server` compose network.

If the worker still logs `Unexpected server response: 401` after the URL is
reachable, the LiveKit server's `Keys` map is misconfigured — see the
"Troubleshooting — agent-worker logs `Unexpected server response: 401`"
section in [`../livekit-server/README.md`](../livekit-server/README.md).

## Troubleshooting — native bindings / libc

Symptom: the container exits at startup with

```
Error: Cannot find module './rtc-node.linux-<arch>-musl.node'
```

Root cause: `@livekit/rtc-ffi-bindings` (transitive dep of `@livekit/rtc-node`)
publishes prebuilt native bindings only for glibc (`linux-{arm64,x64}-gnu`,
plus darwin/win32); there is no musl variant on npm, so Alpine-based images
resolve a non-existent module at runtime.

That is why the base image in `Dockerfile` is `node:20-bookworm-slim` (Debian
glibc) rather than `node:20-alpine` — switching to glibc lets the existing
`*-gnu` prebuilts load, and avoids pulling a `linux/amd64` qemu emulation on
Apple Silicon.

Manual verification (run from `agent-worker/`, requires a populated `.env`):

```bash
docker compose build --no-cache agent-worker
docker compose up -d
sleep 10 && docker compose ps
docker compose logs agent-worker | grep -i "module_not_found\|rtc-node.linux" || echo "no native-binding errors"
docker compose exec agent-worker node -e "require('@livekit/rtc-ffi-bindings'); console.log('ok')"
```

`docker compose ps` should show the service `Up`, the `grep` line should
print `no native-binding errors`, and the final `node -e` should print `ok`
and exit 0.

## Notes

- This package is a standalone Node application at the workspace root. It is not part of a monorepo (no workspaces).
- Module system: CommonJS (`"type": "commonjs"`, `tsconfig` `module: Node16` / `moduleResolution: Node16`). `@livekit/agents` v1.x is consumed via CJS interop; path resolution uses `__dirname`/`path.resolve` rather than `import.meta.url`/`fileURLToPath`.
- Engines: Node `>=20`.
