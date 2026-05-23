# Plan Response — Add lint:fix to Husky Pre-Commit Hook

- From: planner (sub-agent)
- To: Root Agent
- Title: Plan Response — Add lint:fix to Husky Pre-Commit Hook
- Description: Prepend `pnpm -r --if-present run lint:fix` to the Husky pre-commit hook so that ESLint auto-fixes are applied across all apps that support it before Prettier formatting runs.

---

## Approach Summary

Only `.husky/pre-commit` changes. `pnpm -r --if-present run lint:fix` runs lint:fix in livekit-agent and livekit-server, silently skipping livekit-infra. Runs before `pnpm format` so ESLint rewrites code first, then Prettier normalises formatting. The existing `git add .` stages everything.

## Functional Requirements

- `pnpm -r --if-present run lint:fix` runs before `pnpm format` in the pre-commit hook.
- livekit-agent and livekit-server have ESLint auto-fixes applied on every commit.
- livekit-infra is skipped without error.

## Non-Functional Requirements

- No secret/env values read or exposed.
- Changes strictly scoped to `.husky/pre-commit` only.
- No new scripts added to root or app package.json files.

## Files in Scope

| File                 | Action                                                           |
| -------------------- | ---------------------------------------------------------------- |
| `/.husky/pre-commit` | Prepend `pnpm -r --if-present run lint:fix` before `pnpm format` |

## Risks & Assumptions

- If ESLint exits non-zero (unfixable errors), the commit aborts — intentional.
- pnpm>=10.0.0 is enforced; --if-present is fully supported.
- No package.json changes needed.

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                                                                                             | Responsible Role | Dependencies |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ |
| 1   | TODO   | Update `/.husky/pre-commit` — insert `pnpm -r --if-present run lint:fix` as the first line, before `pnpm format` | developer        | none         |
