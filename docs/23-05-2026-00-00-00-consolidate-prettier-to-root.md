# Plan Response — Consolidate Prettier to Root, Remove from App Packages, Update Husky

- From: planner (sub-agent)
- To: Root Agent
- Title: Plan Response — Consolidate Prettier to Root, Remove from App Packages, Update Husky
- Description: Move all Prettier configuration and execution to the monorepo root, removing per-app configs, devDependencies, and format scripts so that `prettier --write .` from the root is the single formatting entrypoint.

---

## Approach Summary

Prettier's config resolution walks up the directory tree — once per-app `.prettierrc` files are removed, every file in the monorepo will resolve to the root config. The root `.prettierrc` will be updated with the canonical config currently only in the app files, the `@trivago/prettier-plugin-sort-imports` plugin will be moved to root devDependencies, and the Husky pre-commit hook will be simplified to a single `pnpm format` invocation (removing the now-redundant recursive `pnpm -r --if-present run format`).

## Functional Requirements

- Root `.prettierrc` contains the full config (singleQuote, trailingComma, semi, tabWidth, printWidth, importOrder, plugin).
- Root `.prettierignore` covers all patterns previously excluded per-app (`.agents/`, `.claude/`, `dist/`).
- `@trivago/prettier-plugin-sort-imports` is in root `devDependencies`.
- Per-app `.prettierrc`, `.prettierignore`, `prettier` devDep, `@trivago/prettier-plugin-sort-imports` devDep, `format`, and `format:check` scripts are all removed.
- Husky pre-commit runs only `pnpm format` (no recursive app invocation).
- `pnpm install` is run after to sync the lockfile.

## Non-Functional Requirements

- No secret/env values read or exposed.
- Changes strictly scoped to prettier consolidation — no unrelated edits.
- Plugin must be resolvable from root `node_modules` (pnpm workspace isolation).

## Files in Scope

| File                                  | Action                                                                                                         |
| ------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `/.prettierrc`                        | Replace `{}` with full config                                                                                  |
| `/.prettierignore`                    | Add `.agents/`, `.claude/`, `dist/` patterns                                                                   |
| `/package.json`                       | Add `@trivago/prettier-plugin-sort-imports ^5.2.2` to root devDeps                                             |
| `/.husky/pre-commit`                  | Remove `pnpm -r --if-present run format` line                                                                  |
| `apps/livekit-agent/.prettierrc`      | Delete                                                                                                         |
| `apps/livekit-agent/.prettierignore`  | Delete                                                                                                         |
| `apps/livekit-agent/package.json`     | Remove `format`, `format:check` scripts; remove `@trivago/prettier-plugin-sort-imports` devDep                 |
| `apps/livekit-server/.prettierrc`     | Delete                                                                                                         |
| `apps/livekit-server/.prettierignore` | Delete                                                                                                         |
| `apps/livekit-server/package.json`    | Remove `format`, `format:check` scripts; remove `prettier` and `@trivago/prettier-plugin-sort-imports` devDeps |
| Run `pnpm install`                    | Sync lockfile                                                                                                  |

## Risks & Assumptions

- `livekit-agent` does not have `prettier` in its own devDeps (relies on root hoisting) — no removal needed there.
- `livekit-infra` has no prettier config or scripts — no changes needed.
- `dist/` added to root `.prettierignore` preemptively to avoid formatting compiled output.
- pnpm workspace isolation requires the plugin to be a direct root dependency — addressed by Task 3.

## Open Questions / Blockers

- None.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                                                                                                                                 | Responsible Role | Dependencies  |
| --- | ------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------- |
| 1   | TODO   | Update `/.prettierrc` — replace `{}` with full canonical config including plugin                                                                     | developer        | none          |
| 2   | TODO   | Update `/.prettierignore` — add `.agents/`, `.claude/`, `dist/` patterns                                                                             | developer        | none          |
| 3   | TODO   | Update `/package.json` — add `@trivago/prettier-plugin-sort-imports ^5.2.2` to root devDeps                                                          | developer        | none          |
| 4   | TODO   | Update `/.husky/pre-commit` — remove `pnpm -r --if-present run format` line                                                                          | developer        | none          |
| 5   | TODO   | Delete `apps/livekit-agent/.prettierrc` and `apps/livekit-agent/.prettierignore`                                                                     | developer        | none          |
| 6   | TODO   | Update `apps/livekit-agent/package.json` — remove `format`, `format:check` scripts and `@trivago/prettier-plugin-sort-imports` devDep                | developer        | task 5        |
| 7   | TODO   | Delete `apps/livekit-server/.prettierrc` and `apps/livekit-server/.prettierignore`                                                                   | developer        | none          |
| 8   | TODO   | Update `apps/livekit-server/package.json` — remove `format`, `format:check` scripts, `prettier`, and `@trivago/prettier-plugin-sort-imports` devDeps | developer        | task 7        |
| 9   | TODO   | Run `pnpm install` at monorepo root to sync lockfile                                                                                                 | developer        | tasks 3, 6, 8 |
