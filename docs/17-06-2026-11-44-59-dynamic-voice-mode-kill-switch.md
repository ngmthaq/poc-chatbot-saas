- Author: Root Agent
- Title: Plan — Dynamic voice-mode kill switch via server env var (`VOICE_MODE_ENABLED`)
- Classification: feature
- Description: Add a `VOICE_MODE_ENABLED` env var to the server as the single source of truth, expose it via a new `GET /config` endpoint, have the client fetch it at runtime to hide the Voice toggle (forcing Text), and enforce it server-side by rejecting `POST /livekit/token` with 403 when voice is disabled.

---

## Approach Summary

- The server env var is the runtime source of truth; the client fetches it dynamically (no client rebuild needed to flip it). The flag is `VOICE_MODE_ENABLED`, default `true` (backward compatible — unset = voice on). The server enforces the flag, and the client hides the Voice toggle and forces Text.
- Server reads `VOICE_MODE_ENABLED` in the yup-validated `configs/env.ts`, exposes `{ voiceModeEnabled }` through a new `GET /config` (mirroring the `/health` controller→service→route→responseHandler-envelope pattern), and guards `LiveKitService.getToken` with a `403` when disabled.
- Client adds a TanStack Query hook that reads `GET /config`; `ModeToggle` drops the Voice option and `HomePage` forces `mode = 'text'` when voice is disabled. TanStack Query dedupes the single request across both consumers.

## Functional Requirements

- Setting `VOICE_MODE_ENABLED=false` on the server and restarting it (no client rebuild) causes: the client hides the Voice toggle and shows only Text; and `POST /livekit/token` returns `403`.
- With `VOICE_MODE_ENABLED=true` or unset, behavior is identical to today (voice available, toggle shows both options, token issued).
- `GET /config` returns the current `voiceModeEnabled` boolean.
- If the client is currently in voice mode when it learns voice is disabled, it reconciles to text mode.

## Non-Functional Requirements

- Follow conventions: server class-based controller/service/route + Pino, `responseHandler` envelope, `http-errors` via the central error handler, yup env validation. Client: Atomic Design, barrel imports, TanStack Query in `hooks/queries/`, `import type`, strict TS, no `console.log`, no `.js` extensions, axios via shared `configs/axiosInstance.ts`, endpoint string in `configs/apiEndpoints.ts`.
- No env values read by agents — keys only.
- yup `boolean()` must correctly coerce the string `"false"` → `false` (env vars are strings); developer to verify.

## Files in Scope

**Server — create**

- `apps/server/src/services/config.service.ts` — `ConfigService.getPublicConfig()` → `{ voiceModeEnabled }`.
- `apps/server/src/controllers/config.controller.ts` — `ConfigController.getConfig` RequestHandler.
- `apps/server/src/routes/config.route.ts` — `GET /` → `responseHandler(configController.getConfig)`.

**Server — modify**

- `apps/server/.env.example` — add `VOICE_MODE_ENABLED=true` with a comment section.
- `apps/server/src/configs/env.ts` — add `VOICE_MODE_ENABLED: yup.boolean().default(true)`.
- `apps/server/src/configs/error-messages.ts` — add `voiceModeDisabled()` message.
- `apps/server/src/routes/index.ts` — mount `router.use('/config', configRouter)`.
- `apps/server/src/services/livekit.service.ts` — in `getToken`, throw `createHttpError(403, errorMessages.voiceModeDisabled())` when `!config.VOICE_MODE_ENABLED`.

**Client — create**

- `apps/client/src/hooks/queries/usePublicConfig.ts` — TanStack Query `GET /config`, yup-validated, returns `{ voiceModeEnabled, isLoading }`.

**Client — modify**

- `apps/client/src/configs/apiEndpoints.ts` — add `get.config()` → `/config`.
- `apps/client/src/hooks/queries/index.ts` — barrel-export the new hook.
- `apps/client/src/components/atoms/ModeToggle/index.tsx` — hide the Voice option when voice is disabled.
- `apps/client/src/components/pages/HomePage/index.tsx` — derive effective mode (force `'text'` when disabled) and reconcile the `modeAtom`.

## Risks & Assumptions

- Client has no env var of its own (consequence of choosing "server is source of truth, client fetches at runtime"). The client-repo work is the runtime-fetch + gating code, not an env var.
- Fail-closed default: while the `/config` query is loading or if it errors, the client treats voice as disabled (hides the toggle). Safe (server enforces 403 anyway) but a transient `/config` outage briefly hides voice.
- `/config` uses the `responseHandler` envelope (like `/health`), so the client reads `response.data.data.voiceModeEnabled`.
- Testing: project `Testing Workflow = Skip-Testing`, so no tester sub-agent / automated tests planned. Verification is manual.

## Open Questions / Blockers

- None. Plan approved by user.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                            | Responsible Role | Dependencies            | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ----------------------- | ------------ |
| 1   | TODO   | Server: add `VOICE_MODE_ENABLED` to `.env.example` + yup schema in `configs/env.ts` (default true, verify `"false"` coercion)                                   | developer        | none                    | `clean-code` |
| 2   | TODO   | Server: add `voiceModeDisabled()` to `error-messages.ts`; create `ConfigService` + `ConfigController` + `config.route.ts`; mount `/config` in `routes/index.ts` | developer        | 1                       | `clean-code` |
| 3   | TODO   | Server: guard `LiveKitService.getToken` with `403` when `VOICE_MODE_ENABLED` is false                                                                           | developer        | 1                       | `clean-code` |
| 4   | TODO   | Client: add `get.config()` endpoint + `usePublicConfig` query hook (yup-validated, fail-closed) + barrel export                                                 | developer        | none (contract-defined) | `clean-code` |
| 5   | TODO   | Client: hide Voice option in `ModeToggle` and force/reconcile Text in `HomePage` when voice disabled                                                            | developer        | 4                       | `clean-code` |
