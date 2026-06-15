- Author: Root Agent
- Title: Plan — Framework-agnostic agent harness (tools + instructions) for LiveKit & LangChain
- Classification: feature
- Description: Add a shared `packages/harness` workspace package that holds tools and instructions as framework-agnostic OOP classes, exposes thin LiveKit and LangChain adapters via subpath exports, and refactor `apps/livekit-agent` to consume it.

---

## Approach Summary

- Create an **internal workspace package** `@call-center-agent/harness` under a new `packages/` glob. Its **core** (`.` export) is a pure OOP layer — an abstract `BaseTool` (name / description / Zod `schema` / `execute()`), six concrete tool subclasses ported from the existing tools, a `ToolRegistry`, and an `AgentInstructions` class — depending only on `zod`, **zero framework deps**.
- Framework coupling lives in **two adapters behind separate subpath exports**: `@call-center-agent/harness/livekit` (`BaseTool[] → Record<string, llm.tool>`) and `@call-center-agent/harness/langchain` (`BaseTool[] → StructuredTool[]`). `@livekit/agents` and `@langchain/core` are **optional peerDependencies**, so the LangChain repo never pulls in LiveKit and vice-versa.
- Refactor `apps/livekit-agent` to depend on the harness: its `tools/index.ts` becomes `toLiveKitTools(toolRegistry)`, and `agents/index.ts` sources instructions from the harness. Migrated tool files + their type files are deleted from the agent. Providers/STT/TTS stay in `livekit-agent`.

## Functional Requirements

- `BaseTool` abstract class defines `name: string`, `description: string`, `schema: ZodTypeAny`, and `abstract execute(args): Promise<string>`; concrete tools extend it.
- All six tools (`getWeather`, `convertCurrency`, `getCoinPrice`, `getGoldPrice`, `getStockPrice`, `searchBranchInformation`) exist as `BaseTool` subclasses with identical behavior and a `ToolRegistry` exposing them as an array/map.
- `AgentInstructions` class reproduces the current instruction text via a `.build()`/`toString()` method.
- `toLiveKitTools(tools)` returns a `Record<string, ReturnType<typeof llm.tool>>` matching the shape `voice.Agent` expects today.
- `toLangChainTools(tools)` returns LangChain `StructuredTool[]` (Zod-schema'd) usable in a LangChain agent.
- `apps/livekit-agent` builds, typechecks, and wires the same six tools + instructions through the harness — runtime behavior unchanged.
- README documents a copy-paste LangChain.js usage example.

## Non-Functional Requirements

- Core export has no framework dependency; adapters isolated behind subpath exports with optional peerDeps (clean separation, least-coupling).
- TypeScript strict settings match the repo (`strict`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`, ES2022, ESM).
- Naming follows `CODING_CONVENTIONS.md`: files `kebab-case` + `.tool.ts` suffix, classes `PascalCase`, API response interfaces in `src/types/*.d.ts`, barrel `index.ts` exports.
- No `console.log` regressions beyond what tools already do; errors never swallowed silently.

## Files in Scope

**Created — `packages/harness/`:**

- `package.json` (name `@call-center-agent/harness`, `exports` for `.`/`./livekit`/`./langchain`, optional peerDeps, build/test/lint scripts), `tsconfig.json`, `vitest.config.ts`, `eslint.config.*`, `README.md`
- `src/index.ts` (core barrel)
- `src/tools/base/base-tool.ts`, `src/tools/{get-weather,convert-currency,get-coin-price,get-gold-price,get-stock-price,search-branch-information}.tool.ts`, `src/tools/registry.ts`, `src/tools/index.ts`
- `src/instructions/instructions.ts`, `src/instructions/index.ts`
- `src/adapters/livekit.adapter.ts`, `src/adapters/langchain.adapter.ts`
- `src/types/*.d.ts` (ported tool response types)
- `src/**/*.test.ts` (tests)

**Modified:**

- `pnpm-workspace.yaml` (add `packages/*`)
- `apps/livekit-agent/package.json` (add `@call-center-agent/harness` workspace dep), `apps/livekit-agent/src/tools/index.ts`, `apps/livekit-agent/src/agents/index.ts`, `apps/livekit-agent/src/agents/instructions.ts`

**Deleted:**

- `apps/livekit-agent/src/tools/*.ts` (the 6 tool files, migrated), and their `src/types/*.d.ts` counterparts

## Risks & Assumptions

- **Assumption:** Package name `@call-center-agent/harness`, private internal workspace package, compiled to `dist/` via `tsc` and exposed through `exports`.
- **Assumption:** `BaseTool.execute(args)` returns `Promise<string>` (matches current tools); LiveKit `ctx` is not surfaced into core tools.
- **Assumption:** Harness adds `@langchain/core` and `@livekit/agents` as devDependencies (to type/test adapters) and optional peerDependencies; `livekit-agent` only needs the `./livekit` subpath.
- **Risk:** `@livekit/agents` `llm.tool()` and `@langchain/core` `tool()`/`StructuredTool` must accept the same Zod schema object — both use Zod 3, pinned in the repo (`zod ^3.25.76`).
- **Risk:** Existing tool filenames are `camelCase` (pre-convention); harness uses documented `kebab-case` + `.tool.ts`. The agent's leftover `tools/` folder is removed, so no naming drift remains.

## Open Questions / Blockers

- None — resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                                          | Responsible Role | Dependencies | Skills        |
| --- | ------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------- |
| 1   | TODO   | Scaffold `packages/harness` (package.json with subpath `exports` + optional peerDeps, tsconfig, vitest config, eslint, empty barrels) and add `packages/*` to `pnpm-workspace.yaml`; verify `pnpm install` + empty build pass | developer        | none         | `clean-code`  |
| 2   | TODO   | Implement abstract `BaseTool` class + core tool types in `src/tools/base/base-tool.ts`                                                                                                                                        | developer        | 1            | `clean-code`  |
| 3   | TODO   | Port the 6 tools into `*.tool.ts` `BaseTool` subclasses, move response types to `src/types/*.d.ts`, build `ToolRegistry` + barrel                                                                                             | developer        | 2            | `clean-code`  |
| 4   | TODO   | Implement `AgentInstructions` class (port instruction text) + barrel                                                                                                                                                          | developer        | 1            | `clean-code`  |
| 5   | TODO   | Implement `LiveKitToolAdapter` (`toLiveKitTools`) at `./livekit` entry                                                                                                                                                        | developer        | 3            | `clean-code`  |
| 6   | TODO   | Implement `LangChainToolAdapter` (`toLangChainTools`) at `./langchain` entry + README LangChain usage example                                                                                                                 | developer        | 3            | `clean-code`  |
| 7   | TODO   | Refactor `apps/livekit-agent` to consume harness (deps, `tools/index.ts`, `agents/index.ts`, instructions), delete migrated files; typecheck + build green                                                                    | developer        | 5,4          | `clean-code`  |
| 8   | TODO   | Unit tests: `BaseTool` + each tool (mock `fetch`), AAA pattern                                                                                                                                                                | tester           | 3            | `aaa-testing` |
| 9   | TODO   | Unit tests: LiveKit + LangChain adapters (correct tool object shape, `execute` delegates)                                                                                                                                     | tester           | 5,6          | `aaa-testing` |
