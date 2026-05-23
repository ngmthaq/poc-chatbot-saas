# Plan Response — Lift useMutation and roomSessionAtom writes out of JoinRoomForm into HomePage

- From: planner
- To: Root Agent
- Title: Plan Response — Lift useMutation and roomSessionAtom writes out of JoinRoomForm into HomePage
- Description: Remove data-fetching and global-state concerns from the `JoinRoomForm` molecule and lift them into the `HomePage` page, restoring Atomic Design boundaries by making the molecule a pure presentation component driven by props.

---

## Approach Summary

Pure lift-and-shift of two hooks (`useMutation` and `useSetAtom`) from `JoinRoomForm` (molecule) up to `HomePage` (page). The molecule is converted into a controlled, dumb component that receives `onJoin`, `isPending`, and `error` as props. `HomePage` absorbs the mutation, wires `onSuccess` to write `roomSessionAtom`, and passes the derived values down. No new files, no dependency changes, no visual change.

---

## Functional Requirements

1. `JoinRoomForm` must not call `useMutation`, `roomService`, or any Jotai setter.
2. `JoinRoomForm` accepts: `onJoin: (identity: string, name?: string) => void`, `isPending: boolean`, `error: Error | null`.
3. On form submit, `JoinRoomForm` calls `props.onJoin(identity, displayName || undefined)`.
4. Loading and error UI inside `JoinRoomForm` driven by `props.isPending` and `props.error`.
5. `HomePage` owns `useMutation` with `onSuccess: (data) => setRoomSession(data)`.
6. `HomePage` passes `onJoin`, `isPending`, `error` to `<JoinRoomForm>`.
7. The `onSuccess?` prop on `JoinRoomForm` is removed entirely.
8. `RoomSession` import in `JoinRoomForm` removed (no longer needed).
9. No visual change.

---

## Non-Functional Requirements

- `verbatimModuleSyntax`: `import type` for all type-only imports.
- `@` alias for all `src/` imports.
- No `console.*` calls added.
- No test files (Skip-Testing).
- No changes outside the two files in scope.

---

## Files in Scope

| #   | File                                                            | Action |
| --- | --------------------------------------------------------------- | ------ |
| 1   | `apps/livekit-client/src/components/molecules/JoinRoomForm.tsx` | Edit   |
| 2   | `apps/livekit-client/src/components/pages/HomePage.tsx`         | Edit   |

---

## Task List

| #   | Status | Task                                                                                                                                                                                                                                                 | Responsible Role | Dependencies | Skills     |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ---------- |
| 1   | DONE   | Edit `JoinRoomForm.tsx`: remove `useMutation`/`useSetAtom`/`roomService`/`RoomSession` imports; remove `onSuccess` prop; add `onJoin`, `isPending`, `error` props; replace `mutate()` call with `props.onJoin(identity, displayName \|\| undefined)` | developer        | —            | clean-code |
| 2   | DONE   | Edit `HomePage.tsx`: add `useMutation` + `roomService` imports; add mutation with `onSuccess → setRoomSession`; pass `onJoin`, `isPending`, `error` to `<JoinRoomForm>`                                                                              | developer        | 1            | clean-code |
| 3   | DONE   | Run typecheck + lint:fix, fix any errors                                                                                                                                                                                                             | developer        | 1, 2         | clean-code |
