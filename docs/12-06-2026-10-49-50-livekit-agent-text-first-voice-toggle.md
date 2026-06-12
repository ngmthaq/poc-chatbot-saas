# Implementation Doc — Text-first chatbot with voice (STT/TTS) toggle in `apps/livekit-agent`

Created: 2026-06-12 10:49:50 (local).
Scope: **`apps/livekit-agent` only.** Server (`apps/server`) and client (`apps/client`) docs will be written separately. This doc explains the _why_, the _how_, and the exact file-by-file changes inside the agent worker.

---

- From: implementer
- To: Root Agent
- Title: Make the agent start as a text chatbot and switch to a voice (STT/TTS) session on demand, in the same session, without losing conversation history.
- Description: Keep one `AgentSession` configured with the full voice pipeline (LLM + STT + TTS + VAD + turn detector), but **start with audio input/output disabled** so it behaves as a pure text chatbot. Expose an RPC method the client calls to flip audio on/off at runtime. Make the system prompt modality-aware so text turns get markdown-friendly answers and voice turns get TTS-friendly answers.

---

## 1. Background & key idea

LiveKit Agents runs every conversation through a single `AgentSession`. That session can carry **both** text and audio I/O at the same time, and each is independently switchable at runtime:

- **Text I/O** uses LiveKit text streams. The agent listens on the `lk.chat` text-stream topic for typed user messages and publishes replies on the `lk.transcription` topic. This is on by default.
- **Audio I/O** uses WebRTC audio tracks driven by the STT → LLM → TTS pipeline. This can be turned off entirely or toggled live.

So a "text chatbot that can become a voice call" is **not** two systems — it is one session that starts with audio disabled and enables it on request. Because it is the same session, the `ChatContext` (full history), the LLM, and all tools (`convertCurrency`, `getWeather`, …) carry over seamlessly when the user switches to voice. Nothing is re-initialized; we only flip audio I/O.

### Verified APIs (LiveKit Docs MCP, Node.js SDK, `@livekit/agents@1.4.x`)

- Start text-only / audio-disabled:
  `session.start({ inputOptions: { audioEnabled: false }, outputOptions: { audioEnabled: false } })`
- Toggle at runtime:
  `session.input.setAudioEnabled(bool)` / `session.output.setAudioEnabled(bool)`; read current state via `session.input.audioEnabled` / `session.output.audioEnabled`.
- Disable typed input (if ever needed): `inputOptions: { textEnabled: false }`.
- Stop in-flight speech before muting: `session.interrupt()`.
- Runtime control channel from client → agent: `ctx.room.localParticipant.registerRpcMethod(name, handler)`. The handler's returned string is delivered back to the caller as the RPC response.
- Modality-aware prompt: `new llm.Instructions({ audio, text })`; the framework auto-selects the variant per turn. For agent-initiated replies, force one with `session.generateReply({ inputModality: 'text' | 'audio' })`.

> Sources: `https://docs.livekit.io/agents/multimodality/text/`, `https://docs.livekit.io/agents/multimodality/instructions/`.

---

## 2. Why configure the full pipeline up front

For the live toggle to work, STT/TTS/VAD/turn-detection must already be wired into the `AgentSession` at start time — they simply sit **dormant** while audio is disabled. Enabling audio activates the existing pipeline; we never rebuild the session. The repo already constructs all of these in `main.ts` and `provider.ts`, so no provider work is required — we only change _startup state_ and _add a control surface_.

The cost trade-off (worth recording): even during the text phase the worker holds STT/TTS provider configuration in memory. That is cheap (no audio frames flow until enabled), but the worker process is heavier than a plain LLM HTTP bot. This is the price of the "instant switch to voice with full context" capability and is the reason to use LiveKit here at all.

---

## 3. End-to-end flow

```
                 ┌──────────────────────── ROOM ────────────────────────┐
  Client  ──┐    │                                                       │
  (typed)   ├──► lk.chat  ─────────────►  AgentSession (audio OFF)       │
            │    │                          LLM + tools  ──► lk.transcription ──► Client
            │    │                          STT/TTS/VAD = dormant         │
            │    │                                                       │
  Client  ──┘    │  RPC "set_voice_mode" ─► handler:                     │
  (button)       │      session.input.setAudioEnabled(true)             │
                 │      session.output.setAudioEnabled(true)            │
                 │      → returns "voice"                                │
                 │                                                       │
  Client  ──────►│  publishes mic track  ─► STT ─► LLM ─► TTS ─► audio ─► Client (speaker)
                 └───────────────────────────────────────────────────────┘
```

1. Agent joins the room with **audio disabled** → acts as a text chatbot.
2. User types; messages arrive on `lk.chat`; replies stream back on `lk.transcription`.
3. User taps "Talk" → client invokes the `set_voice_mode` RPC.
4. Handler enables audio I/O and returns the new mode string. Client then publishes the mic; the dormant pipeline activates.
5. User taps "Stop" → RPC disables audio (after `session.interrupt()`); the agent reverts to text, history intact.

---

## 4. File-by-file changes

> Conventions to honor (from `.claude/CODING_CONVENTIONS.md` + repo memory): ESM + `type: module`; class + singleton-export utils (mirror `apps/server` util pattern); **all `interface`/`type` declarations live in `src/types/*.d.ts`, never inline**; `import type` for type-only imports (verbatimModuleSyntax); no reading of secret _values_.

### 4.1 New type — `src/types/session-mode.d.ts`

Declare the shared mode types here (not inline).

```ts
// src/types/session-mode.d.ts
export type SessionMode = 'text' | 'voice';

export interface SetVoiceModePayload {
  /** true → enable audio I/O (voice); false → text-only. */
  enabled: boolean;
}
```

### 4.2 New helper — `src/agents/session-mode.ts`

A small, focused class that owns _all_ mode transitions, so `main.ts` stays declarative and the toggle logic is unit-testable. Mirrors the repo's class + singleton-export style.

```ts
// src/agents/session-mode.ts
import { voice } from '@livekit/agents';
import type { SessionMode } from '../types/session-mode';

/**
 * Owns text <-> voice transitions for a single AgentSession.
 * The session is always constructed with the full STT/TTS/VAD pipeline;
 * this class only flips audio I/O on/off. Text I/O stays on throughout.
 */
export class SessionModeController {
  constructor(private readonly session: voice.AgentSession) {}

  get mode(): SessionMode {
    return this.session.input.audioEnabled ? 'voice' : 'text';
  }

  /** Enable audio input + output. Pipeline activates; history is preserved. */
  enableVoice(): SessionMode {
    this.session.input.setAudioEnabled(true);
    this.session.output.setAudioEnabled(true);
    return this.mode;
  }

  /** Stop any in-flight speech, then drop back to text-only. */
  disableVoice(): SessionMode {
    // Interrupt first so a half-spoken turn doesn't dangle when audio cuts out.
    this.session.interrupt();
    this.session.input.setAudioEnabled(false);
    this.session.output.setAudioEnabled(false);
    return this.mode;
  }

  set(enabled: boolean): SessionMode {
    return enabled ? this.enableVoice() : this.disableVoice();
  }
}
```

### 4.3 Modality-aware instructions — `src/agents/instructions.ts`

The current prompt assumes voice only ("interacting via voice", "spell out numbers", "never use markdown"). In text mode that produces awkward, formatting-stripped answers. Split it into an **`Instructions`** object with shared base + per-modality guidance.

```ts
// src/agents/instructions.ts
import { dedent, llm } from '@livekit/agents';

const base = dedent`
  You are a friendly, reliable assistant that answers questions, explains topics,
  and completes tasks with available tools.

  # Conversational flow
  - Help the user accomplish their objective efficiently and correctly. Prefer the
    simplest safe step first. Check understanding and adapt.
  - Provide guidance in small steps and confirm completion before continuing.
  - Summarize key results when closing a topic.

  # Tools
  - Use available tools as needed, or upon user request. Collect required inputs first.
  - When tools return structured data, summarize it clearly; don't recite raw identifiers.

  # Guardrails
  - Stay within safe, lawful, appropriate use; decline harmful or out-of-scope requests.
  - For medical, legal, or financial topics, give general information only and suggest a professional.
  - Protect privacy and minimize sensitive data.
`;

const voiceGuidance = dedent`
  # Output rules (VOICE — spoken via text-to-speech)
  - Respond in plain text only. Never use markdown, lists, tables, code, emojis, or JSON.
  - Keep replies brief: one to three sentences. Ask one question at a time.
  - Spell out numbers, phone numbers, and email addresses. Omit "https://" in URLs.
  - Avoid acronyms and words with unclear pronunciation when possible.
  - Spoken input is imperfect: resolve relative expressions (e.g. "next Tuesday"),
    honor verbal self-corrections, and confirm important actions out loud.
`;

const textGuidance = dedent`
  # Output rules (TEXT — typed chat)
  - Take the user's input literally and precisely; it is typed, not transcribed.
  - You MAY use markdown (lists, code blocks, tables, links) where it aids clarity.
  - Be concise but complete; multi-step answers and code are welcome when relevant.
  - Skip spoken-style confirmations; act on exact values as given.
`;

export const instructions = llm.Instructions.tpl`${base}

${new llm.Instructions({ audio: voiceGuidance, text: textGuidance })}`;
```

The framework applies `audio` guidance to spoken turns and `text` guidance to typed turns automatically — even when they interleave in one session.

### 4.4 Agent class — `src/agents/index.ts`

No structural change; it already passes `instructions` straight through. Just confirm the import resolves to the new `Instructions` object (it does — same export name). Tools and LLM stay as-is.

```ts
// src/agents/index.ts  (unchanged body — shown for context)
export class LLMAgent extends voice.Agent {
  constructor() {
    super({
      instructions, // now an llm.Instructions (audio + text variants)
      llm: providerFactory.llm(ProviderType.MISTRAL),
      tools,
    });
  }
}
```

### 4.5 Entry point — `src/main.ts`

Three edits: (a) start with audio disabled, (b) register the RPC toggle, (c) greet via **text** instead of speaking.

```ts
// src/main.ts  (entry only — rest of file unchanged)
import { SessionModeController } from './agents/session-mode';
import type { SetVoiceModePayload } from './types/session-mode';

  entry: async (ctx) => {
    const session = new voice.AgentSession({
      // Full pipeline is configured up front but stays DORMANT until audio is enabled.
      stt: providerFactory.stt(ProviderType.MISTRAL),
      tts: providerFactory.tts(ProviderType.MISTRAL),
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad,
      voiceOptions: {
        preemptiveGeneration: true,
      },
    });

    await session.start({
      agent: new LLMAgent(),
      room: ctx.room,
      // START AS A TEXT CHATBOT: no mic in, no speech out, no audio tracks published.
      inputOptions: {
        audioEnabled: false,
        noiseCancellation: BackgroundVoiceCancellation(), // takes effect once audio is enabled
      },
      outputOptions: {
        audioEnabled: false,
      },
    });

    const modeController = new SessionModeController(session);

    // Control surface: client calls this RPC to switch text <-> voice at runtime.
    ctx.room.localParticipant.registerRpcMethod(
      'set_voice_mode',
      async (data) => {
        const { enabled } = JSON.parse(data.payload) as SetVoiceModePayload;
        const mode = modeController.set(enabled);
        return JSON.stringify({ mode }); // client reads the resulting mode
      },
    );

    await ctx.connect();

    // Greet in TEXT (streams to lk.transcription), not by speaking.
    session.generateReply({
      instructions: 'Greet the user briefly and offer help.',
      inputModality: 'text',
    });
  },
```

> Note: `noiseCancellation` is harmless while audio is off and is the right place to keep it — it activates automatically when the mic track starts.

---

## 5. Contract for the server/client docs (write later)

This is the integration surface the other two docs must match. Pin these names so the three layers agree.

| Concern                         | Value                                                                             | Owner                           |
| ------------------------------- | --------------------------------------------------------------------------------- | ------------------------------- |
| RPC method name                 | `set_voice_mode`                                                                  | agent registers, client invokes |
| RPC request payload             | `{"enabled": boolean}` (JSON string)                                              | client → agent                  |
| RPC response payload            | `{"mode": "text" \| "voice"}` (JSON string)                                       | agent → client                  |
| Text input topic                | `lk.chat` (client `sendText(text, { topic: 'lk.chat' })`)                         | client → agent                  |
| Text/transcription output topic | `lk.transcription` (`registerTextStreamHandler`)                                  | agent → client                  |
| Token grants                    | must allow `canPublish` (for mic when in voice) + `canPublishData` (text streams) | server token util               |

Client steps when switching to voice: (1) call `set_voice_mode {enabled:true}`, (2) on success, `setMicrophoneEnabled(true)` and subscribe to the agent's audio track. To switch back: `setMicrophoneEnabled(false)` then `set_voice_mode {enabled:false}`.

---

## 6. Edge cases & decisions

- **Interrupt before mute.** `disableVoice()` calls `session.interrupt()` first so a partially spoken turn is truncated cleanly instead of being cut mid-frame. (Matches the docs' guidance for pausing audio.)
- **History is shared, not copied.** Both modalities read/write the same `ChatContext`; switching never drops context. Listen to `conversation_item_added` if the client needs to mirror history.
- **Greeting modality.** We greet with `inputModality: 'text'` so the first turn doesn't try to speak into a muted output. If you prefer no greeting until the user acts, remove the `generateReply` call.
- **Turn detection / preemptiveGeneration / VAD** are voice-pipeline concerns; they are inert while audio is off and need no guarding.
- **Disabling text** is possible (`inputOptions.textEnabled: false`) but we keep text always-on — it's the primary modality here.
- **Idempotency.** `set_voice_mode` with the already-current state is a no-op (set + read returns the same mode); the client can call it freely.
- **Single source of truth for mode.** `SessionModeController.mode` derives from `session.input.audioEnabled` — we never track a separate boolean that could drift.

---

## 7. Files in scope

- `apps/livekit-agent/src/types/session-mode.d.ts` — **new**: `SessionMode`, `SetVoiceModePayload`.
- `apps/livekit-agent/src/agents/session-mode.ts` — **new**: `SessionModeController`.
- `apps/livekit-agent/src/agents/instructions.ts` — **edit**: split into modality-aware `llm.Instructions`.
- `apps/livekit-agent/src/agents/index.ts` — **no change** (verify import resolves).
- `apps/livekit-agent/src/main.ts` — **edit**: audio-disabled start, `set_voice_mode` RPC, text greeting.
- `apps/livekit-agent/src/main.ts` import block — add `SessionModeController` + `SetVoiceModePayload` (type-only).

---

## 8. Local verification

1. `pnpm --filter livekit-agent typecheck` — confirm new types/imports compile (verbatimModuleSyntax + `import type`).
2. `pnpm --filter livekit-agent dev` — runs `build` then `node dist/main.js dev`, connecting the worker to your LiveKit instance (`.env.local`: `LIVEKIT_URL`, `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`).
3. **Text path:** join the room from the client (or `node dist/main.js console` and toggle to text mode), type a message → expect a markdown-capable reply on `lk.transcription`, no audio track from the agent.
4. **Toggle path:** invoke `set_voice_mode {"enabled": true}` → expect response `{"mode":"voice"}`, then publish the mic and confirm the agent transcribes (STT), answers (LLM), and speaks (TTS) — with the earlier typed context still in scope.
5. **Toggle back:** `set_voice_mode {"enabled": false}` → agent stops speaking immediately (interrupt) and resumes text-only.
6. Add a unit test for `SessionModeController` (AAA): arrange a fake `AgentSession` with spy `setAudioEnabled`/`interrupt`; act `enableVoice()`/`disableVoice()`; assert calls + returned mode.

---

## 9. Open questions / assumptions

- **OQ1:** Should the agent broadcast its current mode to _all_ participants (e.g. via `localParticipant.setAttributes`) so other clients/observers see it, or is the RPC response to the single caller enough? Assumed: RPC response is enough for now (single-user chat). Revisit if multi-participant.
- **OQ2:** On switch-to-voice, should the agent re-greet by voice ("You're now on voice, how can I help?") or stay silent until the user speaks? Assumed: stay silent; the user initiated the switch.
- **OQ3:** Provider choice for STT/TTS in production — currently `MISTRAL` for both. No change proposed here; confirm cost/latency separately.
- **A1:** Client token grants include `canPublish` + `canPublishData` (handled in the _server_ doc).
- **A2:** `@livekit/agents@1.4.3` `set*AudioEnabled` / `registerRpcMethod` signatures are stable on the installed version (verified against docs rendered 2026-06-12).
