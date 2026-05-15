- From: planner (sub-agent loaded with planner skill)
- To: Root Agent
- Title: Plan Response — LiveKit Server with Docker (production-ready)
- Description: Create a self-contained `livekit-server/` folder with a hardened docker-compose stack (LiveKit + Redis), built-in TURN/TLS configuration, a bootstrap script that generates random API key/secret into a gitignored `.env`, and a README documenting run/stop/regenerate/port-mapping/TLS notes.

---

## Approach Summary

- Build a self-contained `livekit-server/` directory at the repo root so the LiveKit infra is independent of any future agent code, with all secrets kept out of version control. The stack is two services in `docker-compose.yml`: the official `livekit/livekit-server` container (with `restart: unless-stopped`, persistent log/data volume, host networking on RTC ports) and an official `redis:7-alpine` container (password-protected via env, persistent `data/redis/` volume).
- `livekit.yaml` enables Redis pub/sub for multi-node readiness, configures built-in TURN listening on 3478 (UDP/TCP) and 5349 (TLS) with cert paths mounted from `certs/`, and pulls the API key/secret pair from the env-rendered keys section. Production hardening notes (placing behind Caddy/Nginx for WS TLS, exposing only required ports, swapping wildcard binds) are documented in the README — not silently applied — so the operator can review them.
- `scripts/bootstrap.sh` is a POSIX shell script using `openssl rand` to generate a strong API key, API secret, and Redis password on first run, writing them to a freshly created `.env` (chmod 600). It refuses to overwrite an existing `.env` unless `--force` is passed and prints (but never logs) the new key id so the operator can hand it to clients. `.env.example` ships with placeholder names only.
- Testing follows the Code-First convention: no unit tests, but a smoke-test task validates `docker compose config` parses cleanly and `livekit-server --help` exits 0 inside the container image. This satisfies AGENT_RULES "no silent failures" without authoring premature tests.

## Functional Requirements

- Running `bash livekit-server/scripts/bootstrap.sh` on a fresh checkout creates `livekit-server/.env` containing `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, and `REDIS_PASSWORD` with values produced by `openssl rand` (key >= 12 chars, secret >= 32 chars, redis password >= 32 chars) and sets file mode 600.
- Re-running `bootstrap.sh` without `--force` exits non-zero with a message instructing the operator to pass `--force` if rotation is intended; `--force` rotates all three secrets and leaves a timestamped backup `.env.bak.<timestamp>`.
- `docker compose -f livekit-server/docker-compose.yml config` exits 0 (validates the compose file) when `.env` is present.
- `docker compose up -d` starts both services with `restart: unless-stopped`; `livekit-server` becomes healthy and Redis accepts authenticated `PING` from the LiveKit container on the internal compose network.
- LiveKit listens on the documented ports for WS (7880), TCP/UDP RTC (7881 TCP, 7882 UDP fallback), TURN UDP+TCP (3478), and TURN TLS (5349); the port table in `README.md` matches the published ports exactly.
- `.gitignore` blocks `.env`, `.env.bak.*`, `data/`, and `certs/*` (except `certs/.gitkeep`) from being committed.
- `README.md` documents: prerequisites, one-command bootstrap, start/stop/logs/regenerate-secrets commands, a port table, a TLS section explaining that production deployments terminate WS TLS at a reverse proxy (Caddy/Nginx example snippet) and how to point `livekit.yaml` at real TURN certs, and a "rotate secrets" runbook.

## Non-Functional Requirements

- Security: no real secret values committed; `.env.example` contains placeholder names only; bootstrap script never echoes secret values to stdout (only key id / fingerprint); `.env` file mode is 600. (`secret-scanner` clean on the diff.)
- Security: Redis `requirepass` enforced via env; LiveKit container does not run as root where the official image supports a non-root user; documentation explicitly calls out which ports should be firewalled and that binding to `0.0.0.0` is acceptable only when fronted by a reverse proxy or cloud security group. (`security-scanner` phase 4–5 considerations.)
- Reliability: both services use `restart: unless-stopped`; named volumes for Redis persistence and LiveKit log/data; healthchecks defined for both services so compose surfaces failures rather than silently degrading.
- Maintainability (clean-code: KISS, Separation of Concerns): each file has one purpose — compose for orchestration, `livekit.yaml` for server config, `scripts/bootstrap.sh` for secret bootstrap, README for human-readable ops docs; no inline secrets, no business logic in compose, no hardcoded paths inside the bootstrap script (uses `${SCRIPT_DIR}` resolution).
- Observability (AGENT_RULES "log every action"): bootstrap script logs each step it takes (without leaking values); LiveKit `log_level: info` and Redis `loglevel notice` are set explicitly.
- Reproducibility: image tags are pinned (no `:latest`); the chosen tag is recorded in the README under "Assumptions" so future bumps are deliberate.

## Files in Scope

Files to be created (all under `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/`):

- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/docker-compose.yml`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/livekit.yaml`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/redis.conf`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/.env.example`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/.gitignore`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/scripts/bootstrap.sh`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/certs/.gitkeep`
- `/Users/nmthang6/Documents/Workspace/agent-assistant/livekit-server/README.md`

No files outside `livekit-server/` are modified. The Root Agent will separately persist the approved plan markdown under `/Users/nmthang6/Documents/Workspace/agent-assistant/.claude/docs/` per the party-mode workflow.

## Risks & Assumptions

- Assumption: LiveKit image `livekit/livekit-server:v1.7` (or the latest stable v1.x available on Docker Hub at execution time) is used; if a newer stable major exists on 2026-05-14, the developer sub-agent should pin to that current stable tag and record the choice in the README "Versions" section. Tag must be pinned — never `:latest`.
- Assumption: Redis image `redis:7-alpine` is used (stable, small footprint, official). Pinned, no `:latest`.
- Assumption: The user will run the stack on a Linux/macOS host with Docker Engine >= 24 and the `docker compose` v2 plugin; Windows-specific guidance is out of scope.
- Assumption: TLS certificates for TURN (5349) are provided by the operator out-of-band (Let's Encrypt via Caddy on the host or pre-issued PEM files placed in `certs/`). The plan ships paths and documentation, not certs.
- Risk (security): The built-in TURN on 5349 requires real certs to function; if the operator skips cert provisioning, TURN/TLS will fail to bind. README must call this out explicitly and the compose file must not crash-loop without certs — `livekit.yaml` should be templated so TURN/TLS block can be commented out by the operator until certs exist.
- Risk (network exposure): Binding TURN UDP 3478 and RTC UDP 7882 publicly is required for clients behind strict NATs but expands attack surface. README must list these and recommend cloud firewall rules.
- Risk (host-network vs published ports): On Linux, `network_mode: host` is the most reliable way to handle large UDP port ranges for WebRTC; on macOS this is unsupported. Plan uses **published port mapping with an explicit small range** for portability and documents the host-network alternative under "Production tuning" so the operator can switch when deploying to Linux.
- Risk (`.claude/docs/` does not exist): Root Agent persists the approved plan there per workflow — directory must be created by Root Agent, not by this implementation.
- Risk (project is not a git repo): The environment notes "Is directory a git repo: No". The `.gitignore` we create is preventative for when `git init` is run later; it has no effect today. Documented as preventative.
- Assumption: `openssl` is available on the host running `bootstrap.sh` (standard on macOS and most Linux distros). Script will `command -v openssl` and fail-fast with a clear message otherwise — no silent fallback.

## Open Questions / Blockers

- None. All clarifying answers (production-ready, Redis included, built-in TURN/TLS, bootstrap-generated secrets) were supplied by the Root Agent. Image tag and TLS cert provisioning are handled as documented assumptions above, not blockers. If the user wants a specific LiveKit version pin different from the latest stable v1.x at execution time, they should say so before the developer task runs — otherwise the developer will pin to current stable and record it.

## Status

- [x] Ready to execute
- [x] Executed and accepted by reviewer on 2026-05-14
- [ ] Blocked — requires user input on: n/a

## Task List

| #   | Status | Task                                                                                                                                                                                                                                                                                                                                                                                                                                | Responsible Role | Dependencies | Skills                              |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ----------------------------------- |
| 1   | DONE   | Create directory skeleton `livekit-server/` with subdirs `scripts/` and `certs/` (containing `.gitkeep`). No file content yet.                                                                                                                                                                                                                                                                                                      | developer        | none         | `clean-code`                        |
| 2   | DONE   | Create `livekit-server/.gitignore` ignoring `.env`, `.env.bak.*`, `data/`, `certs/*` (except `!certs/.gitkeep`). Justify each entry inline with a comment.                                                                                                                                                                                                                                                                          | developer        | 1            | `clean-code`, `secret-scanner`      |
| 3   | DONE   | Create `livekit-server/.env.example` with placeholder-only keys: `LIVEKIT_API_KEY=`, `LIVEKIT_API_SECRET=`, `REDIS_PASSWORD=`, `LIVEKIT_TURN_DOMAIN=example.com`, plus header comment instructing operators to run `scripts/bootstrap.sh`. No real values.                                                                                                                                                                          | developer        | 1            | `secret-scanner`                    |
| 4   | DONE   | Create `livekit-server/scripts/bootstrap.sh`: POSIX-sh, `set -euo pipefail`, resolves its own dir, checks for `openssl`, refuses to overwrite existing `.env` unless `--force` is passed, on `--force` creates `.env.bak.<timestamp>`, generates `LIVEKIT_API_KEY` (`openssl rand -base64 12`), `LIVEKIT_API_SECRET` (`openssl rand -base64 32`), `REDIS_PASSWORD` (`openssl rand -base64 32`), writes `.env` with mode 600, logs each action (without echoing secret values), prints the new key id only. Make executable. | developer        | 2, 3         | `clean-code`, `secret-scanner`      |
| 5   | DONE   | Create `livekit-server/redis.conf` with: `requirepass ${REDIS_PASSWORD}` placeholder (substituted via `command:` in compose), `appendonly yes`, `loglevel notice`, `bind 0.0.0.0` (compose network is isolated), `protected-mode yes`. Document each directive.                                                                                                                                                                      | developer        | 1            | `clean-code`, `security-scanner`    |
| 6   | DONE   | Create `livekit-server/livekit.yaml`: enables `port: 7880` (WS), `rtc.tcp_port: 7881`, `rtc.udp_port: 7882`, `rtc.use_external_ip: true`, built-in TURN block (`turn.enabled: true`, `udp_port: 3478`, `tls_port: 5349`, `cert_file: /certs/tls.crt`, `key_file: /certs/tls.key`, `domain: ${LIVEKIT_TURN_DOMAIN}`), `redis.address: redis:6379`, `redis.password: ${REDIS_PASSWORD}`, `keys` block referencing env, `log_level: info`. TURN/TLS block clearly commented as requiring certs in `certs/`. | developer        | 1            | `clean-code`, `security-scanner`    |
| 7   | DONE   | Create `livekit-server/docker-compose.yml`: services `livekit` (image pinned to current stable `livekit/livekit-server:vX.Y`, `restart: unless-stopped`, mounts `./livekit.yaml:/etc/livekit.yaml:ro` and `./certs:/certs:ro`, command `--config /etc/livekit.yaml`, env from `.env`, ports `7880:7880`, `7881:7881`, `7882:7882/udp`, `3478:3478/udp`, `3478:3478/tcp`, `5349:5349/tcp`, healthcheck hitting `/`) and `redis` (image `redis:7-alpine`, `restart: unless-stopped`, command `redis-server /usr/local/etc/redis/redis.conf --requirepass $${REDIS_PASSWORD}`, mounts `./redis.conf` and named volume `redis-data:/data`, healthcheck `redis-cli -a $${REDIS_PASSWORD} PING`, no published ports — internal-only). Define `redis-data` named volume. Use compose v2 syntax (no `version:` top key). | developer        | 4, 5, 6      | `clean-code`, `security-scanner`    |
| 8   | DONE   | Create `livekit-server/README.md` with: overview, prerequisites (Docker, openssl), quickstart (`bash scripts/bootstrap.sh && docker compose up -d`), commands table (start, stop, logs, restart, regenerate-secrets via `bootstrap.sh --force`), port table (WS 7880, RTC TCP 7881, RTC UDP 7882, TURN UDP/TCP 3478, TURN TLS 5349, Redis internal-only), TLS production section (Caddy/Nginx reverse-proxy snippet for WS TLS termination, how to drop real certs into `certs/`), security hardening checklist (firewall, rotate secrets, monitor logs), assumptions (image tags chosen). | developer        | 7            | `clean-code`                        |
| 9   | DONE   | Smoke-test the stack files: run `docker compose -f livekit-server/docker-compose.yml config` and confirm exit 0; run `docker run --rm livekit/livekit-server:<pinned-tag> --help` and confirm exit 0; run `bash livekit-server/scripts/bootstrap.sh` against a temp `HOME`-isolated copy and verify `.env` has all three keys, mode 600, and no secret value appears in script stdout. Report a pass/fail summary per check; do not write unit tests (Code-First workflow + infra-only feature).                                                | tester           | 8            | `aaa-testing`, `testing-workflow`   |
| 10  | DONE   | Run `secret-scanner` over the working tree diff for `livekit-server/`. Confirm `.env.example`, `livekit.yaml`, `redis.conf`, `docker-compose.yml`, and `README.md` contain no real secret values (only placeholders or env references). Block completion if any finding is High/Critical.                                                                                                                                          | tester           | 8            | `secret-scanner`                    |
| 11  | DONE   | Run a targeted security review on the new stack: verify no service publishes Redis externally, TURN ports are documented as required firewall openings, no `latest` tags, `requirepass` enforced, `.env` file mode is 600, README documents the reverse-proxy TLS pattern. File findings in the standard security report format.                                                                                                  | tester           | 8            | `security-scanner`                  |
