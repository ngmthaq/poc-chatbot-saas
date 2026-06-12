# Implementation Doc — Client support for the text-first / voice-toggle chatbot (`apps/client`)

Created: 2026-06-12 11:18:26 (local).
Scope: **`apps/client` only.** Third in the set:

- Agent: [12-06-2026-10-49-50-livekit-agent-text-first-voice-toggle.md](./12-06-2026-10-49-50-livekit-agent-text-first-voice-toggle.md)
- Server: [12-06-2026-11-10-51-server-text-first-voice-toggle.md](./12-06-2026-11-10-51-server-text-first-voice-toggle.md) (Refinement A adopted)

This doc covers the React client: rendering a text chat by default, letting the user switch to a voice (STT/TTS) call at runtime, and driving that switch via the `set_voice_mode` RPC + microphone control.

---

- From: implementer
- To: Root Agent
- Title: Make the client a text chatbot UI that can flip into a voice call (and back) in the same session, keeping the conversation visible across both modes.
- Description: Today the client is a **voice-only** call-center UI (`HomePage` + `CallControlBar` wired to `VoiceAssistantControlBar`/mic). We add (1) a text composer that sends on `lk.chat`, (2) a conversation feed that shows both user-typed and agent messages, (3) a mode toggle that performs the `set_voice_mode` RPC against the agent and enables/disables the mic, and (4) mode-aware rendering so the UI shows the right controls. No new transport — everything rides the existing `SessionProvider`/room.

---

## 1. The client owns the toggle — this is the active side

Recall the cross-repo split:

- **Agent** registers `set_voice_mode` and flips its own audio I/O (dormant pipeline → active).
- **Server** mints the token (grants already allow text + mic + RPC) and seeds the `app.mode` attribute. _Not_ in the runtime path.
- **Client (this doc)** is the **driver**: it sends typed text, renders replies, and — when the user clicks "Talk" — calls the RPC and publishes the mic.

So the bulk of the _interactive_ work lives here.

### Verified building blocks (installed deps)

- `@livekit/components-react@2.9.21`: `useSession`/`SessionProvider` (already used), `useTranscriptions` (already used — reads `lk.transcription`), `useLocalParticipant`, `useAgent` (already used via `useAgentCallState`), `RoomAudioRenderer` (already mounted).
- `livekit-client@2.19.0`: `localParticipant.sendText(text, { topic })`, `localParticipant.performRpc({ destinationIdentity, method, payload })`, `localParticipant.setMicrophoneEnabled(bool)`, `participant.attributes`.

> ⚠️ **Verify-before-implement (flagged as OQs, don't block the doc):** the exact option name for `performRpc` (`destinationIdentity` vs `destination_identity`) and whether `TokenSource.endpoint` forwards a request `body` differ slightly across SDK minors. Confirm against `livekit-client@2.19.0` typings when coding. APIs named below match the v2 public surface.

---

## 2. What already works vs. what's missing

| Capability                         | Status     | Where                                                                 |
| ---------------------------------- | ---------- | --------------------------------------------------------------------- |
| Connect + token fetch              | ✅ done    | `LiveKitSessionProvider` (`TokenSource.endpoint` → `/livekit/token`)  |
| Render agent audio                 | ✅ done    | `RoomAudioRenderer` in `HomePage`                                     |
| Show agent text/transcript         | ✅ partial | `useTranscriptions()` → `TranscriptionFeed` (agent side only)         |
| Voice controls (mic, visualizer)   | ✅ done    | `CallControlBar` → `VoiceAssistantControlBar`, `AgentVisualizerPanel` |
| **Send typed messages**            | ❌ missing | needs a composer on `lk.chat`                                         |
| **Show user's own typed messages** | ❌ missing | `useTranscriptions` only carries agent output                         |
| **Mode state (text/voice)**        | ❌ missing | needs `app.mode` read + local toggle                                  |
| **Trigger the toggle**             | ❌ missing | needs `set_voice_mode` RPC + mic enable/disable                       |
| **Mode-aware layout**              | ❌ missing | show composer in text, voice bar in voice                             |

Net: keep the connection + audio plumbing; add a text input, a unified feed, a mode hook, and conditional rendering.

---

## 3. Data flow

```
TEXT MODE (default)
  user types ─► ChatComposer
                 localParticipant.sendText(text, { topic: 'lk.chat' })  ─► agent
                 + optimistic append to chatLogAtom (jotai)
  agent reply ─► lk.transcription ─► useTranscriptions() ─┐
  user msgs   ─► chatLogAtom ─────────────────────────────┴─► ConversationFeed (merged, time-sorted)

SWITCH TO VOICE  (user clicks Talk)
  useSessionMode.setVoice(true):
    1. performRpc({ destinationIdentity: agent.identity, method: 'set_voice_mode',
                    payload: JSON.stringify({ enabled: true }) })  ─► agent enables audio I/O
    2. on resolve → localParticipant.setMicrophoneEnabled(true)    ─► mic track published
    3. set local mode = 'voice'  (also reflected by agent's app.mode if it sets one)

VOICE MODE
  mic ─► agent STT ─► LLM ─► TTS ─► RoomAudioRenderer (speaker)
  transcripts ─► useTranscriptions() ─► ConversationFeed (still visible)

SWITCH TO TEXT (user clicks Stop)
  useSessionMode.setVoice(false):
    1. localParticipant.setMicrophoneEnabled(false)
    2. performRpc(... { enabled: false })  ─► agent interrupts + disables audio
    3. set local mode = 'text'
```

History stays visible across switches because both sources (`chatLogAtom` + `useTranscriptions`) persist for the session.

---

## 4. New & changed pieces (atomic-design aligned)

Follows the repo's structure: each component is a folder with `index.tsx` + `styled.ts` + `types.ts` (+ `configs.ts` when needed); shared state in `hooks/stores`; logic in a colocated hook. Emotion/MUI `styled`, `FC` typing, barrel `index.ts` re-exports.

### 4.1 Store — `src/hooks/stores/chatLog.ts`

A jotai atom holding **user-typed** messages for optimistic display (agent messages come from `useTranscriptions`).

```ts
// src/hooks/stores/chatLog.ts
import { atom } from 'jotai';
import type { ChatLogEntry } from './types';

export const chatLogAtom = atom<ChatLogEntry[]>([]);
```

```ts
// src/hooks/stores/types.ts  (new or extend existing)
export interface ChatLogEntry {
  id: string;
  from: 'user';
  text: string;
  timestamp: number;
}
```

Export both from `src/hooks/stores/index.ts` (currently empty).

### 4.2 Hook — `src/components/pages/HomePage/useSessionMode.ts`

Owns mode state + the toggle side effects. Colocated with `HomePage` like `useAgentCallState`.

```ts
// useSessionMode.ts
import { useAgent, useLocalParticipant } from '@livekit/components-react';
import { useCallback, useState } from 'react';
import type { SessionMode } from './types';

export const useSessionMode = (initial: SessionMode = 'text') => {
  const { localParticipant } = useLocalParticipant();
  const agent = useAgent();
  const [mode, setMode] = useState<SessionMode>(initial);
  const [isSwitching, setIsSwitching] = useState(false);

  const setVoice = useCallback(
    async (enabled: boolean) => {
      if (!agent.identity) return; // agent not joined yet
      setIsSwitching(true);
      try {
        if (enabled) {
          // 1) tell the agent to activate its audio pipeline, THEN publish mic
          await localParticipant.performRpc({
            destinationIdentity: agent.identity,
            method: 'set_voice_mode',
            payload: JSON.stringify({ enabled: true }),
          });
          await localParticipant.setMicrophoneEnabled(true);
          setMode('voice');
        } else {
          // 1) stop the mic, THEN tell the agent to interrupt + go text-only
          await localParticipant.setMicrophoneEnabled(false);
          await localParticipant.performRpc({
            destinationIdentity: agent.identity,
            method: 'set_voice_mode',
            payload: JSON.stringify({ enabled: false }),
          });
          setMode('text');
        }
      } finally {
        setIsSwitching(false);
      }
    },
    [agent.identity, localParticipant],
  );

  return { mode, isSwitching, setVoice };
};
```

Add to `HomePage/types.ts`:

```ts
export type SessionMode = 'text' | 'voice';
```

> Seeding the initial mode from the server's `app.mode` attribute is optional. If wanted, read `localParticipant.attributes['app.mode']` once it's available and pass it as `initial`. Since the server defaults to `text` and the agent starts text-first, defaulting to `'text'` here is correct without reading the attribute (**OQ1**).

### 4.3 Molecule — `src/components/molecules/ChatComposer/`

Text input + send button; writes to `lk.chat` and optimistically appends to `chatLogAtom`.

```tsx
// ChatComposer/index.tsx
import { chatLogAtom } from '@/hooks/stores';
import { useLocalParticipant } from '@livekit/components-react';
import { useSetAtom } from 'jotai';
import { type FC, type FormEvent, useState } from 'react';
import { ComposerForm, ComposerInput, SendButton } from './styled';

export const ChatComposer: FC = () => {
  const { localParticipant } = useLocalParticipant();
  const appendLog = useSetAtom(chatLogAtom);
  const [value, setValue] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;
    setValue('');
    appendLog((prev) => [
      ...prev,
      { id: crypto.randomUUID(), from: 'user', text, timestamp: Date.now() },
    ]);
    await localParticipant.sendText(text, { topic: 'lk.chat' });
  };

  return (
    <ComposerForm onSubmit={handleSubmit}>
      <ComposerInput
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Type a message…"
      />
      <SendButton type="submit" disabled={!value.trim()}>
        Send
      </SendButton>
    </ComposerForm>
  );
};
```

`styled.ts`/`types.ts` per the existing molecule pattern (MUI `TextField`/`IconButton` styled). Register in `molecules/index.ts`.

> **Topic must be `lk.chat`** to match the agent's text-input listener. `useChat()` from components-react is a tempting shortcut but historically used a different topic — only use it if you confirm it targets `lk.chat` in v2.9.21 (**OQ2**). Otherwise `sendText` is the safe, explicit choice.

### 4.4 Molecule — `ConversationFeed` (extend or replace `TranscriptionFeed`)

Merge `useTranscriptions()` (agent side) with `chatLogAtom` (user side) into one time-sorted list. Two options:

- **Minimal:** keep `TranscriptionFeed` as-is for the agent stream and render the user's `chatLogAtom` entries above/interleaved. Simplest, but ordering across the two sources is approximate.
- **Recommended:** a new `ConversationFeed` molecule that normalizes both into `{ from, text, timestamp }[]`, sorts by timestamp, and renders user vs agent bubbles differently.

```ts
// ConversationFeed/useConversation.ts (sketch)
const items = useMemo(() => {
  const user = chatLog.map((m) => ({
    from: 'user',
    text: m.text,
    ts: m.timestamp,
  }));
  const agent = transcriptions
    .filter((t) => t.participantInfo?.identity === agentIdentity) // agent side only
    .map((t) => ({
      from: 'agent',
      text: t.text,
      ts: t.streamInfo?.timestamp ?? 0,
    }));
  return [...user, ...agent].sort((a, b) => a.ts - b.ts);
}, [chatLog, transcriptions, agentIdentity]);
```

> Confirm the timestamp field on `TextStreamData` (`streamInfo.timestamp` vs `firstReceivedTime`) against the installed typings (**OQ3**). Auto-scroll behavior carries over from `TranscriptionFeed`.

### 4.5 Atom — `src/components/atoms/ModeToggleButton/`

A single button that flips mode (label/icon from `configs.ts`: "Talk" ↔ "Stop / Type"). Pure presentational; receives `mode`, `isSwitching`, `onToggle` props. Mirrors existing atoms (`AgentStatusBadge` pattern with `configs.ts` + `styled.ts` + `types.ts`).

### 4.6 Molecule — `CallControlBar` (mode-aware)

Render the right controls per mode and host the toggle. Today it always shows the voice bar.

```tsx
// CallControlBar/index.tsx (revised)
import { ModeToggleButton } from '@/components/atoms';
import { ChatComposer } from '@/components/molecules';
import {
  DisconnectButton,
  StartAudio,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import type { FC } from 'react';
import { ControlBarRoot } from './styled';
import type { CallControlBarProps } from './types';

export const CallControlBar: FC<CallControlBarProps> = ({
  mode,
  isSwitching,
  onToggle,
}) => {
  return (
    <ControlBarRoot data-lk-theme="default">
      {mode === 'text' ? (
        <ChatComposer />
      ) : (
        <>
          <StartAudio label="Enable Audio" />
          <VoiceAssistantControlBar
            style={{ borderTop: 'none' }}
            controls={{ microphone: true, leave: false }}
          />
        </>
      )}
      <ModeToggleButton
        mode={mode}
        isSwitching={isSwitching}
        onToggle={onToggle}
      />
      <DisconnectButton>Leave</DisconnectButton>
    </ControlBarRoot>
  );
};
```

Add `CallControlBarProps` (`mode`, `isSwitching`, `onToggle`) to `CallControlBar/types.ts`.

### 4.7 Page — `HomePage/index.tsx`

Wire the new hook and pass mode down; keep the visualizer/agent card for voice mode only.

```tsx
// inside HomePage component body
const { mode, isSwitching, setVoice } = useSessionMode();

// …in JSX:
// Show the voice visualizer/info only in voice mode (or when agent is speaking):
{mode === 'voice' && (
  <AgentVisualizerPanel agentState={agent.state} {...(audioTrack ? { audioTrack } : {})} />
)}
{/* ConversationFeed replaces/augments TranscriptionFeed and shows in BOTH modes */}
<ConversationFeed transcriptions={transcriptions} />

// footer:
<CallControlBar
  mode={mode}
  isSwitching={isSwitching}
  onToggle={() => setVoice(mode === 'text')}
/>
```

### 4.8 Provider — `LiveKitSessionProvider` (optional `mode` in token request)

The server accepts an optional `mode` (defaults to `text`). To make the client explicitly request a starting mode, include it in the token POST body. Only do this if you want a non-default start; otherwise leave the provider untouched.

```ts
// only if forcing a non-default start mode
TokenSource.endpoint(url, {
  method: 'POST',
  // verify the exact option name for a JSON body in livekit-client@2.19.0 (OQ4)
  body: JSON.stringify({ mode: 'text' }),
  headers: { 'content-type': 'application/json' },
});
```

> Default path needs **no** provider change — `text` is already the server + agent default.

---

## 5. Integration contract (must match agent + server)

| Concern                      | Value                                          | Client's part                                           |
| ---------------------------- | ---------------------------------------------- | ------------------------------------------------------- |
| RPC method                   | `set_voice_mode`                               | `performRpc({ method: 'set_voice_mode' })`              |
| RPC request / response       | `{enabled:boolean}` / `{mode:"text"\|"voice"}` | send `enabled`; may read returned `mode` to confirm     |
| RPC destination              | agent participant                              | `destinationIdentity: agent.identity` (from `useAgent`) |
| Text input topic             | `lk.chat`                                      | `sendText(text, { topic: 'lk.chat' })`                  |
| Text/transcript output topic | `lk.transcription`                             | `useTranscriptions()` (already wired)                   |
| Mic on voice                 | publish mic track                              | `setMicrophoneEnabled(true/false)`                      |
| Starting mode (read)         | participant attr `app.mode`                    | optional seed for `useSessionMode` initial              |
| Starting mode (request)      | token body `mode`                              | optional in `LiveKitSessionProvider`                    |

---

## 6. Files in scope

New:

- `src/hooks/stores/chatLog.ts` + `src/hooks/stores/types.ts` + export from `src/hooks/stores/index.ts`
- `src/components/pages/HomePage/useSessionMode.ts`
- `src/components/molecules/ChatComposer/{index.tsx,styled.ts,types.ts}`
- `src/components/atoms/ModeToggleButton/{index.tsx,styled.ts,types.ts,configs.ts}`
- `src/components/molecules/ConversationFeed/{index.tsx,styled.ts,types.ts}` (+ `useConversation.ts`) — or extend `TranscriptionFeed`

Changed:

- `src/components/molecules/CallControlBar/{index.tsx,types.ts}` — mode-aware + toggle
- `src/components/pages/HomePage/index.tsx` — wire `useSessionMode`, mode-gated visualizer, conversation feed, control-bar props
- `src/components/pages/HomePage/types.ts` — add `SessionMode`
- `src/components/molecules/index.ts`, `src/components/atoms/index.ts` — barrel exports

No change:

- `src/components/providers/LiveKitSessionProvider/index.tsx` (unless §4.8 opted in)
- `src/configs/env.ts` — no new env (`VITE_API_BASE_URL`, `VITE_LIVEKIT_URL` already present)
- `src/components/molecules/AgentVisualizerPanel`, `AgentInfoCard` — reused as-is, just mode-gated in `HomePage`

> Convention reminders: atomic-design folders with `index/styled/types(/configs)`; MUI + emotion `styled`; `type`/`interface` in the folder's `types.ts` (not inline); jotai for cross-component state; barrels via `index.ts`; `@/` path alias.

---

## 7. Local verification

1. `pnpm --filter client typecheck` then `pnpm --filter client dev` (Vite). Ensure agent + server are running.
2. **Text path:** on load, the UI shows the composer (not the mic bar). Type → message appears as a user bubble; agent reply streams into the feed via `useTranscriptions`. No mic permission prompt, no agent audio.
3. **Switch to voice:** click the toggle → expect a mic permission prompt, the voice bar/visualizer to appear, and the agent to start responding by speech. The prior typed conversation stays visible.
4. **Continuity:** confirm the agent answers a voice question that references something typed earlier (proves shared session history).
5. **Switch back:** click toggle → mic stops, agent stops speaking immediately, composer returns. Feed retains everything.
6. **Failure handling:** trigger the RPC before the agent joins (`agent.identity` undefined) → `setVoice` no-ops; verify no crash. Consider disabling the toggle until `agent.canListen`/`agent.identity` is set.
7. **Network tab:** confirm the `/livekit/token` POST body carries `mode` only if §4.8 was applied; otherwise it's the existing empty/default body.

---

## 8. Open questions / assumptions

- **OQ1:** Seed initial mode from `localParticipant.attributes['app.mode']`, or always default to `text` in `useSessionMode`? Assumed: default `text` (matches server + agent defaults); read the attribute only if a `voice` deep-link is needed.
- **OQ2:** Use `sendText(topic:'lk.chat')` (explicit, chosen) vs `useChat()` — confirm `useChat` targets `lk.chat` in `@livekit/components-react@2.9.21` before switching.
- **OQ3:** Exact timestamp field on `TextStreamData` for merge-sorting the feed (`streamInfo.timestamp` vs `firstReceivedTime`). Verify against installed typings.
- **OQ4:** Does `TokenSource.endpoint`'s options object forward a JSON `body`/`headers` in `livekit-client@2.19.0`? If not, send `mode` via a small custom fetch in the provider, or rely on the server default. (Only relevant if forcing non-default start.)
- **OQ5:** Should the visualizer/`AgentInfoCard` be hidden entirely in text mode (assumed yes) or kept as a compact presence indicator? UX call.
- **A1:** Token grants from the server include `canPublish` (mic), `canPublishData` (text + RPC), `canSubscribe` — already true (server doc §2), so no client-side permission gating is needed beyond browser mic consent.
- **A2:** Agent greets in text on entry (agent doc), so the feed is non-empty on load without user action.
- **A3:** `performRpc` resolves with the agent's `{mode}` response; we currently set local mode optimistically and could instead trust the RPC return value as the source of truth — minor, decide during implementation.
