- From: debugger (sub-agent loaded with the matching role skill)
- To: Root Agent
- Title: Plan Response — Fix agent-worker `docker compose up` MODULE_NOT_FOUND for `@livekit/rtc-ffi-bindings` musl native binding
- Description: Switch the agent-worker container from Alpine (musl libc) to a Debian-based glibc Node 20 base image so the prebuilt `@livekit/rtc-ffi-bindings-linux-{arm64,x64}-gnu` binaries resolve at runtime.

---

## Approach Summary

- Root cause is a libc mismatch: `node:20-alpine` provides musl, but `@livekit/rtc-ffi-bindings@0.12.56` (transitive dep of `@livekit/rtc-node@^0.13.0` → resolved `0.13.28`) only publishes prebuilt native modules for `linux-arm64-gnu`, `linux-x64-gnu`, `darwin-{arm64,x64}` and `win32-x64`. On Alpine, `native.js` resolves the platform tuple to `linux-arm64-musl` (Apple Silicon host) or `linux-x64-musl`, neither of which exists on npm, so `require('./rtc-node.linux-<arch>-musl.node')` throws `MODULE_NOT_FOUND` at startup. Yarn's optionalDependencies silently skip the missing musl variant at install time, masking the issue until runtime.
- The minimal, durable fix is to replace `ARG NODE_IMAGE=node:20-alpine` with a glibc image (`node:20-bookworm-slim`) in all three Dockerfile stages, and swap the `apk add --no-cache tini` line for the Debian equivalent (`apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*`). The official Debian-slim Node image already ships a non-root `node` user (uid 1000), so `USER node`, `chown -R node:node /app`, and tini-as-PID-1 semantics are preserved. The runner now uses `/usr/bin/tini` instead of `/sbin/tini`.
- This keeps multi-stage layout, `--frozen-lockfile`, OUTBOUND-only (no `EXPOSE`), and `engines.node >= 20` intact, and avoids `platform: linux/amd64` qemu emulation on Apple Silicon.
- Regression verification is a documented manual reproduction (`docker compose build && up -d && logs`) since the project no longer wires a unit test framework in `agent-worker/`.

## Functional Requirements

- `docker compose build` from `agent-worker/` completes successfully on Apple Silicon (linux/arm64) and on linux/x64 hosts.
- `docker compose up -d` starts the `agent-worker` service and the container stays in `Up` state (no restart loop) for at least 60 seconds with a valid `.env`.
- `docker compose logs agent-worker` shows the worker successfully loading `@livekit/rtc-node` and registering with the LiveKit server, with no `MODULE_NOT_FOUND` / `rtc-node.linux-*-musl.node` error.
- `require.resolve('@livekit/rtc-ffi-bindings/native.js')` inside the running container loads a `*-gnu` prebuilt (`linux-arm64-gnu` on Apple Silicon hosts, `linux-x64-gnu` on x64 hosts) — verifiable by `docker compose exec agent-worker node -e "require('@livekit/rtc-ffi-bindings')"` exiting 0.
- `docker compose down` cleanly stops the container (tini forwards SIGTERM; no orphaned Node process) — preserves existing drain behavior.

## Non-Functional Requirements

- Image must remain non-root at runtime (`USER node`, uid 1000).
- Image must keep tini as PID 1 so SIGTERM forwards to Node for clean LiveKit worker drain.
- No `EXPOSE` directive (OUTBOUND-only worker). `docker-compose.yml` must remain free of `ports:`.
- Multi-stage layout (`builder` / `deps-prod` / `runner`) preserved; devDependencies must not leak into the runner.
- Yarn install must remain `--frozen-lockfile` (and `--production --frozen-lockfile` in deps-prod) for reproducible builds.
- Final image size should remain in a reasonable range for a Node 20 service (target: < 500 MB final image; `node:20-bookworm-slim` adds roughly 60-80 MB over `node:20-alpine`, which is acceptable for a prebuilt-native-binding service).
- No `platform: linux/amd64` pin in compose (qemu on Apple Silicon is slow and fragile).
- `engines.node >= 20` in `package.json` must continue to be satisfied (bookworm-slim ships Node 20.x).
- No new test framework scaffolded; regression verification documented in README or as a verification script comment.

## Files in Scope

- `/Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/Dockerfile` — modify: change `ARG NODE_IMAGE` to `node:20-bookworm-slim`; replace `RUN apk add --no-cache tini` with the `apt-get` equivalent; update `ENTRYPOINT` tini path from `/sbin/tini` to `/usr/bin/tini`; update the leading comment block to remove the "Alpine / musl" assumption and explain why glibc is required (no musl prebuilt for `@livekit/rtc-ffi-bindings`).
- `/Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/README.md` — modify (or add a short "Troubleshooting / Native bindings" section): document why the base image is Debian-slim, and the manual reproduction script that constitutes the regression verification for this bug.
- `/Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/docker-compose.yml` — no change required; verify (read-only) that it neither pins `platform:` nor sets a `ports:` mapping.
- `/Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/package.json` — no change required; verify `engines.node >= 20` still satisfied by `node:20-bookworm-slim`.
- `/Users/nmthang6/Documents/Workspace/agent-assistant/agent-worker/yarn.lock` — no change expected; switching base image must not bust the lockfile (Linux glibc prebuilts are already listed as optionalDependencies in the same package version).

## Risks & Assumptions

- Assumption: `node:20-bookworm-slim` ships a non-root `node` user (uid 1000) — true for the official `node:*-bookworm-slim` images at the time of writing; developer must confirm during implementation.
- Assumption: `tini` is available in Debian bookworm's default apt repos (`apt-cache search tini` confirms `tini` package exists in bookworm/main). If unavailable, fallback is `node --init` (Node 20 supports `--init` for PID-1-like behavior) or `docker run --init` — but the latter requires compose changes.
- Assumption: `apt-get install tini` installs the binary at `/usr/bin/tini` on bookworm-slim. Developer must verify the exact path and update `ENTRYPOINT` accordingly; otherwise use `tini` (PATH lookup) or `dumb-init` as alternatives.
- Risk: Image size grows from ~150 MB (alpine) to ~220-260 MB (bookworm-slim). Acceptable given the requirement for prebuilt native bindings.
- Risk: If a future bump of `@livekit/rtc-node` / `@livekit/rtc-ffi-bindings` starts publishing musl variants, Alpine becomes viable again — but pinning to glibc remains safe and forward-compatible.
- Risk: Other compose stacks in the monorepo (`backend-service/`, `livekit-server/`) may also rely on Alpine assumptions; this fix is scoped to `agent-worker/` only and does not touch them.
- Risk: Apple Silicon hosts will produce a `linux/arm64` image by default — confirm that the resulting container loads `@livekit/rtc-ffi-bindings-linux-arm64-gnu` (which IS published in `yarn.lock` line 513).
- Risk: Removing Alpine also removes `/sbin/tini` — any external tooling, CI scripts, or health probes hardcoding `/sbin/tini` would break. None observed in the repo, but call this out in the PR.
- Risk: The deleted Jest tests (per `git status`) mean there is no automated regression net; the manual verification script in README is the only safety net for this fix going forward.

## Open Questions / Blockers

- Leave empty if none.

## Status

- [x] Ready to execute
- [ ] Blocked — requires user input on: n/a

## Task List

| #   | Status | Task | Responsible Role | Dependencies | Skills |
| --- | ------ | ---- | ---------------- | ------------ | ------ |
| 1   | DONE   | In `agent-worker/Dockerfile`, change `ARG NODE_IMAGE=node:20-alpine` to `ARG NODE_IMAGE=node:20-bookworm-slim`. Do not change any `FROM ${NODE_IMAGE} AS ...` lines. | developer | none | `clean-code` |
| 2   | DONE   | In the same Dockerfile, replace the `RUN apk add --no-cache tini` line in the `runner` stage with: `RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*`. Single layer. | developer | task 1 | `clean-code` |
| 3   | DONE   | In the same Dockerfile, update the `ENTRYPOINT` line from `/sbin/tini` to `/usr/bin/tini`. Confirm path with a throwaway container before committing; fall back to bare `tini` if path differs. | developer | task 2 | `clean-code` |
| 4   | DONE   | In the same Dockerfile, rewrite the leading comment block to explain why the base is `bookworm-slim` (no musl prebuilt for `@livekit/rtc-ffi-bindings`), confirm non-root `node` uid 1000 on bookworm-slim, and note tini-via-apt. | developer | task 3 | `clean-code` |
| 5   | DONE   | In `agent-worker/README.md`, add a "Troubleshooting — native bindings / libc" section documenting the bug symptom, root cause, why base image is Debian-slim, and the manual repro/verification script. | developer | task 4 | `clean-code` |
| 6   | DONE   | Read-only audit: confirm `agent-worker/docker-compose.yml` has no `platform:` and no `ports:`, and `agent-worker/package.json` `engines.node` still expresses `>=20`. | developer | task 5 | `clean-code` |
| 7   | DONE (musl-only) | Manual regression verification on linux/arm64 (Apple Silicon): `docker compose build --no-cache && up -d && sleep 10 && docker compose ps` → must show `Up`; logs must not contain `MODULE_NOT_FOUND` or `rtc-node.linux-arm64-musl.node`. Capture logs. | tester | task 6 | `clean-code` |
| 8   | DONE   | Manual regression verification on linux/x64: `docker buildx build --platform linux/amd64 -t agent-worker:x64-verify .` then `docker run --rm --env-file .env --platform linux/amd64 agent-worker:x64-verify node -e "require('@livekit/rtc-ffi-bindings'); console.log('ok')"` — expect stdout `ok`, exit 0. | tester | task 6 | `clean-code` |
| 9   | DONE   | Manual non-root + tini smoke test: `docker compose exec agent-worker id` → `uid=1000(node)`; `cat /proc/1/comm` → `tini`. | tester | task 7 | `clean-code` |
| 10  | DONE   | Manual SIGTERM/drain smoke test: `docker compose up -d`, wait for registration, then `docker compose down` (or `stop --timeout 30`) — container must exit 0 within timeout. | tester | task 9 | `clean-code` |

> Cycle-1 status: musl root cause fully fixed. Cycle-1 alone unmasked a separate `zod` peer-dep crash addressed in cycle 2 — see `20-05-2026-10-32-36-add-zod-peer-dep.md`.
