# Plan Response — Impressive LiveKit Call-Center Agent UI for HomePage

- From: planner (sub-agent loaded with planner role)
- To: Root Agent
- Title: Plan Response — Impressive LiveKit Call-Center Agent UI for HomePage
- Description: Decompose the HomePage redesign into 3 atoms, 4 molecules, and a full HomePage orchestration component using @livekit/components-react, MUI, and LiveKit hooks.

---

## Approach Summary

Decompose the UI into **3 new atoms** and **4 new molecules** following Atomic Design, then wire everything into a redesigned `HomePage`. The layout features a full-viewport dark-themed dashboard: a header bar (room name + connection state), a central audio visualizer (`BarVisualizer`) with an agent info card (identity, name, metadata, quality, mute state), a live transcription feed, and a bottom control bar (mic toggle, disconnect, start-audio unblock). The session connection lifecycle remains owned by `LiveKitSessionProvider` — `HomePage` only consumes hooks.

## Functional Requirements

- Focus layout: centered visualizer panel as the hero element
- Audio track: rendered via `RoomAudioRenderer` (system) + `AudioTrack` (fed to `BarVisualizer`)
- Audio visualizer: `BarVisualizer` (28 bars, styled with LiveKit CSS vars, state-driven animation)
- Connection quality indicator: `ConnectionQualityBadge` atom wrapping `ConnectionQualityIndicator`
- Participant info: agent name, identity, metadata, state badge in `AgentInfoCard`
- Track muted indicator: `MutedStatusDot` wrapping `TrackMutedIndicator`
- Connect button: shown as "Start New Call" (page reload) after session ends/fails
- Disconnect button: via `VoiceAssistantControlBar` + `DisconnectButton` in `CallControlBar`
- Live transcription feed: `TranscriptionFeed` molecule using `useTranscriptions()`
- State-conditional rendering: connecting/idle/active/failed/finished states each show appropriate UI

## Non-Functional Requirements

- TypeScript strict mode; all props typed with interfaces
- Clean-code: SOLID, DRY, KISS, Separation of Concerns
- No new dependencies — use only existing packages
- No modifications to LiveKitSessionProvider, routes, or backend services
- Barrel exports maintained for atoms and molecules

## Files in Scope

**Create:**

- `apps/livekit-client/src/components/atoms/AgentStatusBadge/index.tsx`
- `apps/livekit-client/src/components/atoms/ConnectionQualityBadge/index.tsx`
- `apps/livekit-client/src/components/atoms/MutedStatusDot/index.tsx`
- `apps/livekit-client/src/components/molecules/AgentInfoCard/index.tsx`
- `apps/livekit-client/src/components/molecules/AgentVisualizerPanel/index.tsx`
- `apps/livekit-client/src/components/molecules/TranscriptionFeed/index.tsx`
- `apps/livekit-client/src/components/molecules/CallControlBar/index.tsx`

**Modify:**

- `apps/livekit-client/src/components/atoms/index.ts`
- `apps/livekit-client/src/components/molecules/index.ts`
- `apps/livekit-client/src/components/pages/HomePage/index.tsx`

## Risks & Assumptions

- MUI's light ThemeProvider conflicts with the dark LiveKit theme — mitigated with `data-lk-theme="default"` on root + explicit `sx` dark color overrides throughout
- `agent.*` fields (`identity`, `name`, `metadata`) are only available in certain union states — guarded with `agent.canListen` / `agent.isConnected` checks
- "Connect" button semantics: the provider auto-connects on mount; a manual reconnect after session end triggers `window.location.reload()`
- `TrackMutedIndicator` only rendered when `agent.microphoneTrack` is defined

## Open Questions / Blockers

None.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                   | Responsible Role | Dependencies | Skills       |
| --- | ------ | -------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Create `AgentStatusBadge` atom         | developer        | none         | `clean-code` |
| 2   | TODO   | Create `ConnectionQualityBadge` atom   | developer        | none         | `clean-code` |
| 3   | TODO   | Create `MutedStatusDot` atom           | developer        | none         | `clean-code` |
| 4   | TODO   | Update `atoms/index.ts` barrel         | developer        | 1,2,3        | `clean-code` |
| 5   | TODO   | Create `AgentInfoCard` molecule        | developer        | 4            | `clean-code` |
| 6   | TODO   | Create `AgentVisualizerPanel` molecule | developer        | none         | `clean-code` |
| 7   | TODO   | Create `TranscriptionFeed` molecule    | developer        | none         | `clean-code` |
| 8   | TODO   | Create `CallControlBar` molecule       | developer        | none         | `clean-code` |
| 9   | TODO   | Update `molecules/index.ts` barrel     | developer        | 5,6,7,8      | `clean-code` |
| 10  | TODO   | Redesign `HomePage` component          | developer        | 9            | `clean-code` |
