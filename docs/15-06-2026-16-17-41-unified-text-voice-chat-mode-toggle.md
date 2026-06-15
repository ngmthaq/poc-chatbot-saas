- Author: Root Agent
- Title: Plan — Unified text/voice chat surface with mode toggle + shared display context
- Classification: feature
- Description: Add a single-page client UI with a text/voice mode switch — text mode talks to the existing `/chat` deepagent endpoint, voice mode uses the existing LiveKit flow — with one unified, persisted client-side transcript shown across both modes and the inactive mode torn down on switch.

---

## Approach Summary

- **Client-only feature.** The agent system (deepagent + harness), the server `POST /chat` endpoint, and the LiveKit voice agent already exist and work. No server, livekit-agent, or infra changes.
- A **Jotai store** (lives at the root, above the LiveKit session) holds (a) the current `mode` and (b) a **unified conversation list** that both modes append to. Because it sits above the LiveKit provider, it survives voice teardown — that _is_ the "display continuity."
- The **LiveKit session is mounted only in voice mode**. Switching to text unmounts it → room disconnects → mic/connection freed. Switching back remounts → reconnects. (Tear-down-on-switch, as chosen.)
- Text mode posts to `/chat` via a TanStack Query mutation (request/response, no streaming), keeping the returned `threadId` for conversational memory within the deepagent process.
- A small **bridge** inside voice mode mirrors finalized LiveKit transcriptions into the unified conversation list so they persist after the room is torn down.

## Functional Requirements

- One page renders a **Text / Voice toggle**; default mode is **Text** (so no LiveKit connection or mic prompt on load).
- **Text mode:** message input + send → `POST /chat { message, threadId? }` → appends user message and agent `reply` to the unified conversation; persists `threadId` across sends.
- **Voice mode:** existing voice UI (visualizer, agent info, control bar); finalized transcriptions appended to the unified conversation.
- The **unified conversation transcript is visible in both modes** and is preserved when switching either direction.
- Switching **out of voice disconnects the LiveKit room**; switching **into voice reconnects**. Switching out of text aborts any in-flight request.

## Non-Functional Requirements

- Follow client conventions: Atomic Design folders (`atoms`/`molecules`), barrel imports, `@emotion/styled` (no inline styles except `--lk-*`), Jotai for global UI state, TanStack Query for async, `logger` (no `console.log`), strict TS (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`), `import type`, no `.js` extensions.
- No secrets/env values read. Axios via the shared `configs/axiosInstance.ts`; endpoint string in `configs/apiEndpoints.ts`.
- Mode switch and message send must not leak a live LiveKit connection while in text mode.

## Files in Scope

**Create**

- `apps/client/src/hooks/stores/useChatModeStore.ts` — `modeAtom` (`'text' | 'voice'`) + selector hook.
- `apps/client/src/hooks/stores/useConversationStore.ts` — unified `conversationAtom` (`ConversationEntry[]`) + append/reset helpers.
- `apps/client/src/types/conversation.d.ts` — `ConversationEntry`, `ConversationRole`, `ConversationSource`, `ChatMode`.
- `apps/client/src/hooks/mutations/useSendChatMessage.ts` — TanStack mutation → `POST /chat`.
- `apps/client/src/components/atoms/ModeToggle/` (`index.tsx`, `styled.ts`, `types.ts`, `configs.ts`) — MUI `ToggleButtonGroup`.
- `apps/client/src/components/molecules/ConversationFeed/` (`index.tsx`, `styled.ts`, `types.ts`) — renders the unified conversation (user/agent bubbles, source tag).
- `apps/client/src/components/molecules/ChatPanel/` (`index.tsx`, `styled.ts`, `types.ts`) — text input + send, wires the mutation, appends to conversation.
- `apps/client/src/components/molecules/VoiceTranscriptionBridge/index.tsx` — headless; syncs finalized `useTranscriptions()` into the conversation atom.

**Modify**

- `apps/client/src/configs/apiEndpoints.ts` — add `post.chat()`.
- `apps/client/src/routes/index.tsx` — host the mode toggle; mount `LiveKitSessionProvider` only in voice mode.
- `apps/client/src/components/pages/HomePage/index.tsx` (+ `styled.ts`, `types.ts`) — split into Text vs Voice content; render `ConversationFeed` in both; mount `VoiceTranscriptionBridge` in voice mode.
- Barrels: `hooks/stores/index.ts`, `hooks/mutations/index.ts`, `components/atoms/index.ts`, `components/molecules/index.ts`.

## Risks & Assumptions

- **Assumption:** "Keep context" = client-side display continuity only (confirmed). The deepagent thread and a fresh LiveKit session do **not** share agent memory across a switch — e.g. a name said by voice is visible in the transcript but the text agent won't "know" it. This is the accepted Tier-1 behavior.
- **Assumption:** Default mode = Text. (Flag if you'd prefer Voice or a neutral landing.)
- **Risk:** Voice transcriptions are tied to the live room; the bridge must copy finalized segments into the atom _before_ teardown, or late segments are lost. Mitigation: sync on every transcription update while voice is mounted.
- **Risk:** Reconnecting voice starts a brand-new LiveKit session/greeting each time (no resume). Acceptable under tear-down-on-switch.
- **Assumption:** `threadId` lives in client memory only; a page reload starts a new conversation (matches the deepagent's in-process `MemorySaver`).

## Open Questions / Blockers

- None. (Default mode assumption noted above.)

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                               | Responsible Role | Dependencies | Skills       |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | ------------ |
| 1   | DONE   | Add `conversation.d.ts` types (`ConversationEntry`/`Role`/`Source`/`ChatMode`)                                                                                     | developer        | none         | `clean-code` |
| 2   | DONE   | Create `useChatModeStore` (`modeAtom`) + `useConversationStore` (append/reset); export via `hooks/stores/index.ts`                                                 | developer        | 1            | `clean-code` |
| 3   | DONE   | Add `post.chat()` to `apiEndpoints.ts`; create `useSendChatMessage` mutation; export via `hooks/mutations/index.ts`                                                | developer        | 1            | `clean-code` |
| 4   | DONE   | Build `ModeToggle` atom; export via `atoms/index.ts`                                                                                                               | developer        | 2            | `clean-code` |
| 5   | DONE   | Build `ConversationFeed` molecule (unified bubbles); export via `molecules/index.ts`                                                                               | developer        | 1,2          | `clean-code` |
| 6   | DONE   | Build `ChatPanel` molecule (input + send → mutation → append)                                                                                                      | developer        | 2,3,5        | `clean-code` |
| 7   | DONE   | Build headless `VoiceTranscriptionBridge` (sync finalized transcriptions → conversation atom)                                                                      | developer        | 2            | `clean-code` |
| 8   | DONE   | Restructure `routes/index.tsx` + `HomePage` — toggle, conditional voice-only `LiveKitSessionProvider`, render `ConversationFeed` both modes, mount bridge in voice | developer        | 4,5,6,7      | `clean-code` |
