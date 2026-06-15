- Author: Root Agent
- Title: Plan — infra `.env`→`.env.local` + env-driven providers in livekit-agent
- Classification: feature (config/refactor)
- Description: (1) Switch `apps/infra` from `.env` to `.env.local` across compose `env_file:` directives, compose CLI interpolation (`--env-file`), the copy-env script, and README — preserving existing values by renaming the on-disk file. (2) Make `livekit-agent` select its LLM/STT/TTS providers from `LLM_PROVIDER` / `STT_PROVIDER` / `TTS_PROVIDER` env vars via a new zod-validated `src/configs/env.ts`, mirroring deepagent.

---

## Approach Summary

- **Task 1:** `.env` currently serves two roles in compose — `env_file:` (container env) and `${VAR}` interpolation (auto-loaded from `.env` only). Update all six `env_file: - .env` -> `- .env.local`, add `--env-file .env.local` to the compose scripts so interpolation also reads `.env.local`, fix `copy-env.sh` + README, and `mv` the existing on-disk `apps/infra/.env` -> `.env.local` (no content read) to keep current values. `.env.local` is already gitignored.
- **Task 2:** Convert `livekit-agent`'s `ProviderType` from a numeric to a string enum so values map directly through `z.nativeEnum`. Add `src/configs/env.ts` (loads dotenv at module top — same fix applied in deepagent — and validates the three provider vars, defaulting all to `MISTRAL`). `main.ts` and `agents/index.ts` read the selected providers from this config instead of the hardcoded `ProviderType.MISTRAL`. Behavior unchanged when vars are unset.

## Functional Requirements

- `apps/infra`: `pnpm infra dev` / `dev:down` / `prod` / `prod:down` / `build` all work using `.env.local`; both container env injection and `${VAR}` port interpolation resolve from `.env.local`. No remaining references to a bare `.env`.
- `livekit-agent`: setting `LLM_PROVIDER` / `STT_PROVIDER` / `TTS_PROVIDER` (e.g. `OPENAI`, `MISTRAL`, `DEEPGRAM`) selects the corresponding provider; unset -> `MISTRAL` (current behavior). An unsupported value for a modality throws a clear error from the existing factory.
- `livekit-agent/.env.example` documents the three new vars and their valid values.

## Non-Functional Requirements

- TypeScript strict; `pnpm --filter livekit-agent typecheck`, `lint`, `build` pass.
- No secrets read or committed; `.env.example` keeps empty/non-secret defaults.
- No behavior change to other apps; deepagent untouched.

## Files in Scope

**Task 1 — infra:**

- Modify: `apps/infra/docker-compose.yml` (6x `env_file` -> `.env.local`)
- Modify: `apps/infra/package.json` (add `--env-file .env.local` to the 5 compose scripts)
- Modify: `scripts/copy-env.sh` (infra line -> `.env.local`)
- Modify: `apps/infra/README.md` (`cp .env.example .env` -> `.env.local`)
- Rename (on disk, untracked): `apps/infra/.env` -> `apps/infra/.env.local` via `mv` (no read)

**Task 2 — livekit-agent:**

- Modify: `apps/livekit-agent/src/agents/provider.ts` (numeric enum -> string enum; registries/factories unchanged)
- Create: `apps/livekit-agent/src/configs/env.ts` (zod env, dotenv at top, exports typed config)
- Create: `apps/livekit-agent/src/types/agent-config.d.ts` (config interface, per `types/*.d.ts` convention)
- Modify: `apps/livekit-agent/src/main.ts` (drop local `dotenv.config`; use `env.STT_PROVIDER` / `env.TTS_PROVIDER`)
- Modify: `apps/livekit-agent/src/agents/index.ts` (use `env.LLM_PROVIDER`)
- Modify: `apps/livekit-agent/.env.example` (add the three provider vars)

## Risks & Assumptions

- **Assumption:** provider env values are the exact `ProviderType` member names (uppercase, e.g. `MISTRAL`), validated by `z.nativeEnum`. Documented in `.env.example`.
- **Assumption:** `env.ts` validates only the three provider vars; LiveKit connection vars (`LIVEKIT_URL`, etc.) remain read by `@livekit/agents` internally as today.
- **Risk (low):** numeric->string enum change — developer greps for every `ProviderType` reference (only `provider.ts`, `main.ts`, `agents/index.ts` expected) to confirm nothing relies on numeric values.
- **Risk (low):** `--env-file` global-flag placement in compose scripts (`docker compose --env-file .env.local --profile dev up ...`); verified by `docker compose ... config` resolving without warnings (no Docker daemon needed for `config`).
- Tests skipped per `Skip-Testing` workflow.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status  | Task                                                                                                                                                                                                                                                                           | Responsible Role | Dependencies | Skills                         |
| --- | ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | ------------------------------ |
| 1   | DONE    | infra: switch compose `env_file:` (5x — file has 5, not 6) to `.env.local`; add `--env-file .env.local` to the 5 compose scripts in `apps/infra/package.json`; update `scripts/copy-env.sh` + `apps/infra/README.md`; `mv` on-disk `apps/infra/.env` -> `.env.local` (no read) | developer        | none         | `clean-code`, `secret-scanner` |
| 2   | DONE    | livekit-agent: convert `ProviderType` to string enum in `provider.ts`                                                                                                                                                                                                          | developer        | none         | `clean-code`                   |
| 3   | DONE    | livekit-agent: create `src/configs/env.ts` (zod, dotenv-at-top) + `src/types/agent-config.d.ts`, validating `LLM_PROVIDER`/`STT_PROVIDER`/`TTS_PROVIDER` (default `MISTRAL`)                                                                                                   | developer        | 2            | `clean-code`                   |
| 4   | DONE    | livekit-agent: wire `main.ts` (STT/TTS) + `agents/index.ts` (LLM) to read from env config; remove local `dotenv.config`; add the 3 vars to `.env.example`                                                                                                                      | developer        | 3            | `clean-code`, `secret-scanner` |
| 5   | SKIPPED | Tests — skipped: project Testing Workflow is `Skip-Testing`                                                                                                                                                                                                                    | tester           | —            | `aaa-testing`                  |

> **Execution outcome (Root Agent):** Both tasks complete and accepted. infra fully switched to `.env.local` (5 `env_file:` directives + 5 compose scripts via `--env-file` + copy-env + README; on-disk `.env` renamed; `docker compose config` resolves). livekit-agent providers now env-driven (`ProviderType` string enum; new zod `configs/env.ts` with dotenv-at-top; `main.ts`/`agents/index.ts` read `STT/TTS/LLM_PROVIDER`; defaults MISTRAL). typecheck/lint/build pass; no secrets. Note: a separate, user-made edit set deepagent's `LLM_PROVIDER` default to `MISTRAL` — intentional, left as-is.

> Delegation: Task 1 (infra) and Tasks 2–4 (livekit-agent) have disjoint file scopes -> two developer sub-agents in parallel. Root Agent reviews both against this plan + runs secret scan before reporting.
