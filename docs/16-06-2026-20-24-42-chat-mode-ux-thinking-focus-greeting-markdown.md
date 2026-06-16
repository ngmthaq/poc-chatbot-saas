- Author: Root Agent
- Title: Plan — Chat-mode UX: thinking UI, auto-focus, greeting, markdown rendering
- Classification: feature
- Description: Enhance the text chat mode with an in-feed animated thinking indicator, input auto-focus after replies, a seeded agent greeting on mount, and markdown rendering for agent bubbles.

---

## Approach Summary

- Four cohesive client-side enhancements to text chat mode, all touching the `ChatView` / `ChatPanel` / `ConversationFeed` molecule cluster and the chat form/conversation hooks.
- Thinking UI is driven by the existing `isPending` flag from `useSendChatMessage`, surfaced to `ConversationFeed` as an animated agent-side dots bubble (no store mutation — it's transient UI).
- Auto-focus uses a `ref` on `MessageField`, refocused when `isPending` transitions back to `false`.
- Greeting is appended as a real agent `ConversationEntry` once on mount when the feed is empty, guarded against React StrictMode double-invocation.
- Markdown rendering adds `react-markdown` + `remark-gfm` (safe by default — no raw HTML), applied only to agent bubbles; user bubbles stay plain text.

## Functional Requirements

- While a chat reply is in flight (`isPending`), an agent-side bubble with animated dots appears at the bottom of the feed and is removed when the reply arrives.
- After each agent reply lands, keyboard focus returns to the message input automatically.
- On entering text mode with an empty conversation, an agent greeting bubble "Hello! How can I help you today?" is shown as a normal agent entry; it is not duplicated on re-render/StrictMode.
- Agent reply bubbles render markdown (bold, lists, inline/blocks code, links, tables via gfm); user bubbles remain plain text.

## Non-Functional Requirements

- Follow Atomic Design folder layout (`index.tsx` / `styled.ts` / `types.ts`), barrel imports, `@emotion/styled` (no inline styles), single quotes, 2-space, semicolons.
- TypeScript strict compliance (`exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`).
- Markdown renderer must not allow raw HTML injection (react-markdown default — no `rehype-raw`).
- No `console.log`; use `logger` if logging is needed.

## Files in Scope

- `apps/client/package.json` — add `react-markdown`, `remark-gfm` deps (modified)
- `apps/client/src/components/molecules/ConversationFeed/index.tsx` — thinking bubble + markdown rendering (modified)
- `apps/client/src/components/molecules/ConversationFeed/styled.ts` — animated dots styles (modified)
- `apps/client/src/components/molecules/ConversationFeed/types.ts` — props for `isThinking` (modified)
- `apps/client/src/components/atoms/MarkdownMessage/` — new atom wrapping `react-markdown` with bubble-friendly styling (`index.tsx`, `styled.ts`, `types.ts`) (created)
- `apps/client/src/components/atoms/index.ts` — export new atom (modified)
- `apps/client/src/components/molecules/ChatPanel/index.tsx` — input ref + auto-focus on `isPending` falling edge (modified)
- `apps/client/src/components/molecules/ChatView/index.tsx` — pass `isThinking` to feed, seed greeting on mount (modified)
- `apps/client/src/hooks/forms/useChatForm.ts` — expose what's needed for focus/thinking (only if required) (possibly modified)
- `apps/client/src/components/molecules/ConversationFeed/configs.ts` — greeting constant (created, if a config home is preferred)

## Risks & Assumptions

- Assumption: "Seed on mount" means seed once per ChatView mount when the feed is empty — not re-seed every time the user clears history. Switching to voice and back will re-seed only if the conversation is empty.
- Assumption: `isPending`/`error` need to be readable by `ChatView` (for the thinking bubble) and `ChatPanel` (for focus). Currently `useChatForm` is instantiated only inside `ChatPanel`. To avoid two independent formik instances, the thinking state will be derived from a single source — plan lifts the chat-form hook to `ChatView` and passes props down.
- Risk: Adding deps requires `pnpm install`; lockfile changes. Versions must satisfy React 18.
- Risk: `react-markdown` default link rendering opens in same tab — will add `target="_blank"` + `rel="noopener noreferrer"` for links.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                | Responsible Role | Dependencies | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | DONE   | Add `react-markdown` + `remark-gfm` to `apps/client/package.json` and install (lockfile update)                                                     | developer        | none         | `clean-code` |
| 2   | DONE   | Create `atoms/MarkdownMessage` (index/styled/types) wrapping react-markdown+gfm, safe (no raw HTML), links open in new tab; export via atoms barrel | developer        | task 1       | `clean-code` |
| 3   | DONE   | Render agent bubbles via `MarkdownMessage` in `ConversationFeed`; keep user bubbles plain text                                                      | developer        | task 2       | `clean-code` |
| 4   | DONE   | Add animated thinking dots bubble (styled + `isThinking` prop) to `ConversationFeed`, shown agent-side at feed bottom                               | developer        | none         | `clean-code` |
| 5   | DONE   | Lift chat form/mutation state to `ChatView`; pass `isThinking` (`isPending`) into `ConversationFeed`; pass focus control into `ChatPanel`           | developer        | task 4       | `clean-code` |
| 6   | DONE   | Add input `ref` + auto-focus on `isPending` falling edge in `ChatPanel`                                                                             | developer        | task 5       | `clean-code` |
| 7   | DONE   | Seed greeting agent entry "Hello! How can I help you today?" on mount when feed empty, StrictMode-guarded                                           | developer        | none         | `clean-code` |
| 8   | DONE   | Run `pnpm client tsc`/lint to verify strict-mode/type compliance                                                                                    | developer        | tasks 1-7    | `clean-code` |

> Testing Workflow is Skip-Testing (per PROJECT_OVERVIEW) — no tester sub-agent is spawned; verification is type-check + lint only.
