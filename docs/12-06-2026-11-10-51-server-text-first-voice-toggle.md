# Implementation Doc — Server support for the text-first / voice-toggle chatbot (`apps/server`)

Created: 2026-06-12 11:10:51 (local).
Scope: **`apps/server` only.** Companion to the agent doc ([12-06-2026-10-49-50-livekit-agent-text-first-voice-toggle.md](./12-06-2026-10-49-50-livekit-agent-text-first-voice-toggle.md)). The client doc is separate. This doc explains the server's _actual_ role in the feature, what already works, and the additions that make the starting mode server-controlled and observable.

**Decision (2026-06-12):** **Refinement A is adopted** — the server accepts an optional `mode`, advertises it as the `app.mode` participant attribute, and passes it to the agent via dispatch metadata. Grants stay permissive (`canPublish: true`) so any session can upgrade text → voice. Refinement B (strict least-privilege text-only tokens) was **considered and not adopted** — see §4.

---

- From: implementer
- To: Root Agent
- Title: Mint tokens and dispatch the agent so a participant can start in a text chatbot session and switch to voice (STT/TTS) at runtime.
- Description: The text ↔ voice toggle is a **client → agent RPC** that happens _inside the room at runtime_. The server is **not** on that path. The server's job is bounded to two things it already does: (1) mint a join token whose grants permit both text and voice, and (2) dispatch the agent into the room. Everything below is about doing those two correctly and, optionally, letting the server choose/advertise the _default_ mode.

---

## 1. The server is not in the toggle path — read this first

It is important not to over-build here. The runtime switch is performed entirely by:

```
client.localParticipant.performRpc({ method: 'set_voice_mode', payload }) ──► agent.localParticipant (registerRpcMethod)
```

That round-trip never touches `apps/server`. The server is a **one-shot at join time**: it returns a signed JWT (with the agent dispatched) and then steps out. So the server work is small and mostly a _verification_ that the existing `/token` endpoint already grants what the feature needs — plus two optional ergonomics (default-mode control + observability).

Per `AGENT_RULES.md` (least privilege, don't expand scope beyond the request), we do **not** add new endpoints, sockets, or runtime control surfaces on the server.

---

## 2. What already works (no change required)

The current `LiveKitService.getToken` ([src/services/livekit.service.ts](../apps/server/src/services/livekit.service.ts)) already issues exactly the grants this feature needs:

```ts
at.addGrant({
  roomJoin: true,
  room: roomName,
  canPublish: true, // ← lets the client publish a MIC track when toggled to voice
  canPublishData: true, // ← REQUIRED for text streams (lk.chat) AND for performRpc (set_voice_mode)
  canSubscribe: true, // ← hear the agent's TTS audio + receive lk.transcription text
  canUpdateOwnMetadata: true,
});
```

Grant → capability mapping for this feature:

| Grant               | Enables                      | Needed for                                                 |
| ------------------- | ---------------------------- | ---------------------------------------------------------- |
| `canPublishData`    | data channels + text streams | typing on `lk.chat`, **invoking the `set_voice_mode` RPC** |
| `canSubscribe`      | receive tracks + streams     | reading `lk.transcription`, hearing agent TTS              |
| `canPublish`        | publish media tracks         | publishing the mic **after** switching to voice            |
| `roomConfig.agents` | agent dispatch               | the agent worker actually joins the room                   |

> **Key takeaway:** RPC (`performRpc`) rides the data channel, so `canPublishData` is what authorizes the toggle. It is already set. The default `/token` response is sufficient for the full text-first → voice flow **as-is**.

The agent is already dispatched via the token's `RoomConfiguration`:

```ts
at.roomConfig = new RoomConfiguration({
  agents: [
    new RoomAgentDispatch({ agentName: this.config.LIVEKIT_AGENT_NAME }),
  ],
});
```

**If you do nothing else, the feature works.** §3 (adopted) layers default-mode control on top; §4 is a recorded alternative we are _not_ implementing.

---

## 3. Refinement A (ADOPTED) — let the server choose/advertise the default mode

The agent doc starts every session in **text** mode (hardcoded). If you want the _server_ to decide the default mode per request (e.g. a "call now" button that should open straight into voice), pass it two ways:

1. **To the agent**, via `RoomAgentDispatch.metadata` — a string the agent reads from `ctx.job.metadata` on entry. This is the clean server → agent config channel.
2. **To all participants**, via the participant's initial **attributes** (`app.mode`) — observable by the client and any other participant for UI state.

This keeps a single, server-authored source of truth for the _initial_ mode, while the runtime toggle remains client-driven.

### 3.1 Validator — add an optional `mode` field

[src/validators/get-livekit-token.validator.ts](../apps/server/src/validators/get-livekit-token.validator.ts):

```ts
import * as yup from 'yup';
import type { InferType } from 'yup';

export const getLiveKitTokenSchema = yup.object({
  roomName: yup.string().optional(),
  participantIdentity: yup.string().optional(),
  participantName: yup.string().optional(),
  participantMetadata: yup.string().optional(),
  participantAttributes: yup
    .object()
    .test(
      'is-string-record',
      'participantAttributes must be an object with string values',
      (value) => {
        if (value === undefined || value === null) return true;
        return Object.values(value).every((v) => typeof v === 'string');
      },
    )
    .optional(),
  // NEW: desired starting modality. Defaults to text-first to match the agent.
  mode: yup
    .string()
    .oneOf(['text', 'voice'], 'mode must be "text" or "voice"')
    .default('text'),
  roomConfig: yup.mixed().optional(),
});

export type GetLiveKitTokenBody = InferType<typeof getLiveKitTokenSchema>;
```

The request body is `snake_case` on the wire and camelized by the route's `prepare` step (`humps.camelizeKeys`), so clients send `"mode": "voice"` directly. `mode` needs no transformation.

### 3.2 Service — wire `mode` into attributes + dispatch metadata

[src/services/livekit.service.ts](../apps/server/src/services/livekit.service.ts), inside `getToken`:

```ts
const mode = body.mode ?? 'text';

// Advertise the starting mode to every participant (UI can read participant.attributes['app.mode']).
const participantAttributes = {
  ...(body.participantAttributes ?? {}),
  'app.mode': mode,
};

const at = this.liveKitTokenUtil.createAccessToken({
  identity: participantIdentity,
  name: participantName,
  metadata: participantMetadata,
  attributes: participantAttributes,
  ttl: '1h',
});

// grants unchanged — canPublish/canPublishData/canSubscribe already cover both modes
at.addGrant({
  roomJoin: true,
  room: roomName,
  canPublish: true,
  canPublishData: true,
  canSubscribe: true,
  canUpdateOwnMetadata: true,
});

if (body.roomConfig) {
  at.roomConfig = new RoomConfiguration(body.roomConfig);
} else {
  at.roomConfig = new RoomConfiguration({
    agents: [
      new RoomAgentDispatch({
        agentName: this.config.LIVEKIT_AGENT_NAME,
        // Server → agent config channel: the agent reads this from ctx.job.metadata.
        metadata: JSON.stringify({ defaultMode: mode }),
      }),
    ],
  });
}
```

> **Cross-repo note:** for `defaultMode` to actually change agent behavior, the agent's `entry` must read `ctx.job.metadata` and call `modeController.enableVoice()` when `defaultMode === 'voice'`. That is a _follow-up_ to the agent doc (which currently hardcodes text-first). Until the agent reads it, `mode` only drives the `app.mode` attribute (observability) and is harmless. Flag this as **OQ1**.

---

## 4. Refinement B (CONSIDERED — NOT ADOPTED) — strict text-only (least-privilege) tokens

Recorded for future reference only; **do not implement** under the current decision.

Refinement A keeps `canPublish: true`, so a "text" session _can_ be upgraded to voice by the client — which is exactly what this product wants. Refinement B was the alternative for a class of users who must **never** publish audio (e.g. a public/embedded widget): withhold `canPublish` so the mic can't be published even if the client tries.

```ts
// NOT ADOPTED — illustrative only
const allowVoice = mode === 'voice' || body.allowVoiceUpgrade === true;
at.addGrant({
  /* … */ canPublish: allowVoice /* false → mic can never be published */,
});
```

Why not adopted: the product is "text that can become a full voice call," so every session needs the option to publish a mic. Locking `canPublish` to `false` would break the core toggle for those users. Revisit only if a genuinely listen/type-only persona (e.g. an anonymous embedded widget) is introduced later.

---

## 5. Integration contract (must match the agent + client docs)

These names are the cross-repo seam. The server only _seeds_ them; the agent registers the RPC and the client invokes it.

| Concern                    | Value                                                 | Server's part                         |
| -------------------------- | ----------------------------------------------------- | ------------------------------------- |
| RPC method name            | `set_voice_mode`                                      | none (client↔agent only)              |
| RPC request / response     | `{enabled:boolean}` / `{mode:"text"\|"voice"}`        | none                                  |
| Text input topic           | `lk.chat`                                             | grant `canPublishData` ✅             |
| Text output topic          | `lk.transcription`                                    | grant `canSubscribe` ✅               |
| Mic publish on voice       | client publishes track                                | grant `canPublish` ✅                 |
| Starting mode (observable) | participant attribute `app.mode` = `text`\|`voice`    | **set in token** (§3.2)               |
| Starting mode (to agent)   | dispatch `metadata` `{"defaultMode":"text"\|"voice"}` | **set in dispatch** (§3.2)            |
| Agent identity             | `config.LIVEKIT_AGENT_NAME`                           | dispatched via `RoomConfiguration` ✅ |

---

## 6. Files in scope

Minimal (refinement A only):

- `apps/server/src/validators/get-livekit-token.validator.ts` — **edit**: add optional `mode` (`'text'|'voice'`, default `'text'`).
- `apps/server/src/services/livekit.service.ts` — **edit**: merge `app.mode` into `participantAttributes`; add `metadata` to `RoomAgentDispatch`.

No changes needed:

- `apps/server/src/utils/livekit-token.utils.ts` — generic `AccessToken` wrapper; already passes `attributes` through.
- `apps/server/src/controllers/livekit.controller.ts`, `routes/livekit.route.ts` — body flows through unchanged (the route already camelizes via `humps`).
- `apps/server/src/configs/env.ts` — `LIVEKIT_*` keys already defined; no new env required.
- `apps/server/src/utils/livekit-agent.utils.ts` — `AgentDispatchClient` is for _explicit_ post-hoc dispatch; the token-embedded `RoomConfiguration` path is what's used here, so it stays as-is.

> Convention reminders (`.claude/CODING_CONVENTIONS.md` + repo memory): yup for validation; `InferType` for body types or `src/types/*.d.ts` for shared interfaces (never inline `interface`/`type` in logic files); `humps` for snake ↔ camel at the boundary; classes instantiated with `new` (no new singletons introduced); never read env _values_ in logs — key names only.

---

## 7. Local verification

1. `pnpm --filter server typecheck` — confirm the `mode` field + `InferType` change compile.
2. `pnpm --filter server dev` (tsx watch) then exercise the endpoint:
   ```bash
   curl -s -X POST localhost:3000/livekit/token \
     -H 'content-type: application/json' \
     -d '{"room_name":"demo","mode":"text"}' | jq
   ```
   Expect a `participant_token`, `server_url`, `room_name` (decamelized response unchanged).
3. Decode the returned JWT (e.g. jwt.io) and assert the `video` grant block has `canPublish`, `canPublishData`, `canSubscribe` = true, and that `roomConfig.agents[0].metadata` is `{"defaultMode":"text"}`.
4. Join with a client; confirm the participant's `attributes['app.mode']` reads `text`.
5. Negative test: `"mode":"phone"` → expect a 4xx validation error (`mode must be "text" or "voice"`) from `requestValidator`.
6. Default test: omit `mode` entirely → response still valid; decoded JWT keeps `canPublish: true` and `roomConfig.agents[0].metadata` is `{"defaultMode":"text"}`.

---

## 8. Open questions / assumptions

- **OQ1:** Should the agent actually honor `defaultMode` from dispatch metadata, or always start in text and let the client switch? Assumed: agent stays text-first for now; `mode` only seeds the `app.mode` attribute until the agent doc is extended to read `ctx.job.metadata`.
- **OQ2:** ~~Do we need the strict least-privilege text-only token (§4)?~~ **Resolved 2026-06-12:** No — Refinement B not adopted; all sessions keep `canPublish: true` so any text session can upgrade to voice.
- **OQ3:** Attribute key namespace — `app.mode` chosen to avoid clashing with reserved `lk.*` attributes. Confirm this matches whatever the client doc will read.
- **A1:** No new env vars; `LIVEKIT_URL/API_KEY/API_SECRET/AGENT_NAME` already validated in `configs/env.ts`.
- **A2:** `livekit-server-sdk@2.15.3` `RoomAgentDispatch` accepts a `metadata` string (verified against installed dep). If a future SDK bump changes the field, adjust §3.2.
- **A3:** The token TTL stays `1h`; a long voice call beyond an hour would need refresh — out of scope here, note for the client doc if relevant.
