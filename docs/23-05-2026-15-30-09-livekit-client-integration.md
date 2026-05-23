# Plan Response — Install @livekit/components-react & livekit-client and integrate with livekit-server API

- From: planner
- To: Root Agent
- Title: Plan Response — Install @livekit/components-react & livekit-client and integrate with livekit-server API
- Description: Install `@livekit/components-react`, `@livekit/components-styles`, and `livekit-client` in `apps/livekit-client`, create a `RoomService` to call `POST /rooms/join`, build a join form (`JoinRoomForm` molecule), a `ConferencePage` template-level page, and wire `<LiveKitRoom>` + `<VideoConference>` as the video conference UI, with disconnect returning the user to the join screen.

---

## Approach Summary

The existing server `POST /rooms/join` returns `{ roomName, token }` — not the LiveKit standard endpoint format (`{ server_url, participant_token }`), so `TokenSource.endpoint` and `useSession` cannot be used; `LiveKitRoom` with direct token props is the correct approach. The client manually calls the join API via a new class-based `RoomService`, receives the token and room name, stores them in a Jotai atom (`roomSessionAtom`), then renders `<LiveKitRoom serverUrl token connect>` with `<VideoConference>` inside. State machine is simple: if `roomSessionAtom` is null, render the join form; if populated, render the conference. On disconnect (`onDisconnected` callback), clear `roomSessionAtom`. The existing `HomePage` is refactored to own this two-state render. CSS is imported at the top of `main.tsx` via `import '@livekit/components-styles'`.

---

## Functional Requirements

1. `@livekit/components-react`, `@livekit/components-styles`, and `livekit-client` are installed as runtime dependencies.
2. `RoomService.join(identity, name?)` calls `POST /rooms/join` and returns `{ roomName, token }`.
3. A `JoinRoomForm` molecule renders two fields (`identity`, `displayName`) and a submit button; calls the join API on submit; shows a loading/error state.
4. On successful join, `roomSessionAtom` is set with `{ roomName, token }` and the conference view is rendered.
5. The conference view renders `<LiveKitRoom serverUrl={VITE_LIVEKIT_URL} token connect audio video onDisconnected>` wrapping `<VideoConference />`.
6. When the user disconnects from the room, `roomSessionAtom` is cleared and the join form is shown again.
7. `@livekit/components-styles` CSS is imported in `main.tsx` so LiveKit default styles apply globally.
8. No existing files other than those listed in scope are modified.

---

## Non-Functional Requirements

- `verbatimModuleSyntax`: all type-only imports use `import type`.
- Class-based `RoomService` with a `roomService` singleton export, following the existing pattern.
- Atomic Design boundaries: service in `services/`, atom in `stores/`, form in `components/molecules/`, page logic in `components/pages/`.
- `VITE_LIVEKIT_URL` read from `import.meta.env['VITE_LIVEKIT_URL']` — validated at startup.
- No `console.*` calls that log tokens or secrets.
- MUI components used for all form UI — consistent with existing MUI v6 usage.
- TanStack Query (`useMutation`) used for the join API call.
- No test files created (Skip-Testing).

---

## Files in Scope

| #   | File                                                            | Action | Notes                                                                                                                |
| --- | --------------------------------------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------- | ------------ |
| 1   | `apps/livekit-client/package.json`                              | Edit   | Add `@livekit/components-react`, `@livekit/components-styles`, `livekit-client` to `dependencies` (via pnpm install) |
| 2   | `apps/livekit-client/src/stores/index.ts`                       | Edit   | Add `RoomSession` type and `roomSessionAtom: atom<RoomSession                                                        | null>(null)` |
| 3   | `apps/livekit-client/src/services/roomService.ts`               | Create | Class-based `RoomService` with `join(identity, name?)` method, plus `roomService` singleton                          |
| 4   | `apps/livekit-client/src/services/index.ts`                     | Edit   | Add `export * from './roomService'`                                                                                  |
| 5   | `apps/livekit-client/src/components/molecules/JoinRoomForm.tsx` | Create | MUI form with identity + displayName fields; uses `useMutation`; sets `roomSessionAtom` on success                   |
| 6   | `apps/livekit-client/src/components/molecules/index.ts`         | Edit   | Add `export * from './JoinRoomForm'`                                                                                 |
| 7   | `apps/livekit-client/src/components/pages/ConferenceRoom.tsx`   | Create | Renders `<LiveKitRoom>` wrapping `<VideoConference />`; `onDisconnected` calls `setRoomSession(null)`                |
| 8   | `apps/livekit-client/src/components/pages/HomePage.tsx`         | Edit   | Two-branch render: null roomSession → join form; else → conference view                                              |
| 9   | `apps/livekit-client/src/components/pages/index.ts`             | Edit   | Add `export * from './ConferenceRoom'`                                                                               |
| 10  | `apps/livekit-client/src/main.tsx`                              | Edit   | Add `import '@livekit/components-styles'` at the top                                                                 |

---

## Risks & Assumptions

- **API mismatch risk**: The server's `POST /rooms/join` returns `{ roomName, token }`, not the LiveKit standard `{ server_url, participant_token }`. `TokenSource.endpoint` cannot be used; `LiveKitRoom` with direct token props is correct.
- **`@livekit/components-styles` CSS**: The correct import is `import '@livekit/components-styles'` (separate package).
- **`livekit-client` is a peer dep**: Both must be installed explicitly in `apps/livekit-client`.
- **`VITE_LIVEKIT_URL` validation**: Must be set in `.env.local` before the dev server can connect to LiveKit.
- **Room name not displayed in UI**: Stored in atom for potential future use.
- **MUI + LiveKit CSS specificity**: No conflict expected (`.lk-*` vs MUI scoped classes).

---

## Open Questions / Blockers

None.

---

## Status

| #   | Status | Task                                                                                                       | Responsible Role | Dependencies | Skills                     |
| --- | ------ | ---------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------- |
| 1   | DONE   | Run `pnpm --filter livekit-client add @livekit/components-react @livekit/components-styles livekit-client` | developer        | —            | clean-code                 |
| 2   | DONE   | Edit `src/stores/index.ts` — add `RoomSession` type and `roomSessionAtom`                                  | developer        | 1            | clean-code                 |
| 3   | DONE   | Create `src/services/roomService.ts` — class `RoomService` + singleton                                     | developer        | 1            | clean-code, secret-scanner |
| 4   | DONE   | Edit `src/services/index.ts` — barrel export                                                               | developer        | 3            | clean-code                 |
| 5   | DONE   | Create `src/components/molecules/JoinRoomForm.tsx` — MUI form with useMutation                             | developer        | 2, 4         | clean-code                 |
| 6   | DONE   | Edit `src/components/molecules/index.ts` — barrel export                                                   | developer        | 5            | clean-code                 |
| 7   | DONE   | Create `src/components/pages/ConferenceRoom.tsx` — LiveKitRoom + VideoConference                           | developer        | 1            | clean-code, livekit-agents |
| 8   | DONE   | Edit `src/components/pages/HomePage.tsx` — two-branch render                                               | developer        | 5, 7         | clean-code                 |
| 9   | DONE   | Edit `src/components/pages/index.ts` — barrel export                                                       | developer        | 7            | clean-code                 |
| 10  | DONE   | Edit `src/main.tsx` — add CSS import                                                                       | developer        | 1            | clean-code                 |
| 11  | DONE   | Run typecheck + lint:fix, fix all errors                                                                   | developer        | 2–10         | clean-code                 |
