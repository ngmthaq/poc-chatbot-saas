- Author: Root Agent
- Title: Plan — Drop `.js` import extensions in `@call-center-agent/harness`
- Classification: feature (refactor / build-convention change)
- Description: Switch the harness build from plain `tsc` to `tsup` so the source can use clean extensionless relative imports while the emitted `dist/` stays runtime-valid ESM, then strip all `.js` extensions from source and add an ESLint guard against regressions.

---

## Approach Summary

- Plain `tsc` emits import specifiers verbatim, so the `.js` extensions in source exist only to keep the emitted Node-ESM `dist/` resolvable. Replacing the build with **tsup** (esbuild + `dts`) means each entry is bundled into runtime-valid ESM, so internal relative imports no longer need any extension at runtime — letting the source go clean.
- tsup builds the three `exports` entries (`.` → `index.ts`, `./livekit` → `livekit.adapter.ts`, `./langchain` → `langchain.adapter.ts`); `zod`/`@livekit/agents`/`langchain` stay external (tsup auto-externalizes deps & peerDeps).
- An ESLint guard forbids relative imports ending in `.js` so the convention can't regress. The only current consumer, `livekit-agent`, bundles via vite and is verified green at the end.

## Functional Requirements

- No relative import in `packages/harness/src/` ends in `.js` (~19 imports across `index.ts`, `tools/*`, `instructions/*`, `utils/*`).
- `pnpm --filter @call-center-agent/harness build` emits `dist/index.js`, `dist/adapters/livekit.adapter.js`, `dist/adapters/langchain.adapter.js` (+ matching `.d.ts`) so the existing `exports` map keeps resolving.
- `pnpm --filter @call-center-agent/harness lint` errors on any relative `*.js` import and passes on the cleaned source.
- `apps/livekit-agent` typecheck (`tsc --noEmit`) and `vite build` stay green against the rebuilt harness.

## Non-Functional Requirements

- Minimal new dependencies: add `tsup` only; implement the lint guard with ESLint core `no-restricted-imports` (no new plugin) where feasible.
- Preserve the public `exports` contract and sourcemaps + declaration maps.
- Keep `tsconfig.json` for `typecheck`/dts; respect existing ESLint flat-config style.

## Files in Scope

- `packages/harness/package.json` (build script → `tsup`; add `tsup` devDep)
- `packages/harness/tsup.config.ts` (new)
- `packages/harness/src/index.ts`, `src/tools/*.ts`, `src/instructions/*.ts`, `src/utils/index.ts` (strip `.js`)
- `packages/harness/eslint.config.ts` (add guard)
- `pnpm-lock.yaml` (install)
- Verify-only: `apps/livekit-agent` (typecheck + vite build)

## Risks & Assumptions

- **Assumption:** tsup bundling that inlines internal modules is acceptable; dist will have fewer files than today, but all three `exports` entry files remain present. If a 1:1 dist/source file tree is required, switch to the `tsc-alias` approach instead.
- **Risk:** tsup ESM code-splitting could emit shared chunks; mitigated by configuring entry-preserving output (e.g. `splitting: false`) so the `exports` paths resolve exactly.
- **Risk:** peerDeps must remain external; mitigated by tsup's default externalization + verification.
- The harness has **no tests/vitest config** today; the regression guard is the ESLint rule, so tester work verifies the rule rather than adding a unit-test harness.

## Open Questions / Blockers

- None — build approach (tsup) and regression guard (ESLint rule) confirmed.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                                                                                                                      | Responsible Role | Dependencies | Skills        |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------- |
| 1   | TODO   | Add `tsup` devDep + `tsup.config.ts` (3 entries: `index`, `adapters/livekit.adapter`, `adapters/langchain.adapter`; `format: esm`, `dts: true`, `sourcemap: true`, `clean: true`, entry-preserving output); point `package.json` `build` → `tsup`; `pnpm install`. AC: build emits the 3 `exports` entry `.js` + `.d.ts`. | developer        | none         | `clean-code`  |
| 2   | TODO   | Strip `.js` from every relative import in `src/` (index, tools/_, instructions/_, utils/\*); keep adapters extensionless. AC: no relative import ends in `.js`; `tsc --noEmit` passes.                                                                                                                                    | developer        | none         | `clean-code`  |
| 3   | TODO   | Add ESLint guard forbidding relative imports ending in `.js` (prefer core `no-restricted-imports` regex, no new plugin); ensure `pnpm lint` passes on cleaned source.                                                                                                                                                     | developer        | 2            | `clean-code`  |
| 4   | TODO   | Rebuild harness; verify `apps/livekit-agent` `tsc --noEmit` and `vite build` are green.                                                                                                                                                                                                                                   | developer        | 1, 2, 3      | `clean-code`  |
| 5   | TODO   | Verify the guard: inject a temporary relative `*.js` import, confirm `pnpm lint` errors on it, revert; confirm clean source lints clean.                                                                                                                                                                                  | tester           | 3            | `aaa-testing` |
