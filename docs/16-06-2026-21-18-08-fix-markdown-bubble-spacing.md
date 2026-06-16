- Author: Root Agent
- Title: Plan — Fix hard-to-read markdown spacing in agent chat bubbles
- Classification: bug
- Description: Stop inherited `white-space: pre-wrap` from rendering react-markdown inter-element newlines as visible blank lines, and tighten list/paragraph spacing.

---

## Approach Summary

- Root cause: the shared agent `Bubble` (`ConversationFeed/styled.ts`) sets `whiteSpace: 'pre-wrap'` for plain user text. `MarkdownMessage` renders inside that bubble and inherits `pre-wrap`. react-markdown emits literal `\n\n` whitespace text nodes between block elements (paragraphs, `ol`, `li`); under `pre-wrap` those newlines render as visible blank lines, producing large vertical gaps that make the response hard to read.
- Fix: override `white-space: normal` on `MarkdownRoot` so the markdown subtree collapses inter-element whitespace, and tighten nested list / paragraph margins so child content (e.g. Role/Focus) sits directly under each numbered item.

## Functional Requirements

- Agent markdown replies render with normal, compact spacing — no large blank gaps between list markers and their content or between list items.
- Markdown features (bold, ordered/unordered lists, nesting, code, links, tables) still render correctly.
- User (plain-text) bubbles keep `pre-wrap` behavior; voice mode untouched.

## Non-Functional Requirements

- `@emotion`/MUI `styled` only, no inline styles. TypeScript strict. Single quotes, 2-space, semicolons.

## Files in Scope

- Modify: `apps/client/src/components/atoms/MarkdownMessage/styled.ts`

## Risks & Assumptions

- Assumption: setting `white-space: normal` on `MarkdownRoot` is sufficient because children inherit `normal` from it, overriding the `pre-wrap` cascade from `Bubble`.
- Risk: none significant — change is presentation-only, scoped to one styled file.

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                           | Responsible Role | Dependencies | Skills       |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | DONE   | Add `whiteSpace: 'normal'` to `MarkdownRoot` and tighten nested `ul/ol`/`p`/`li` margins so markdown renders compactly without blank-line gaps | developer        | none         | `clean-code` |
| 2   | DONE   | Verify with `pnpm client typecheck` and `pnpm client lint`                                                                                     | developer        | task 1       | `clean-code` |

> Testing Workflow is Skip-Testing — no tester sub-agent; verification is type-check + lint + visual root-cause reasoning.
