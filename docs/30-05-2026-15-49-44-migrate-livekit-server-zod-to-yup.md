# Plan: Migrate `livekit-server` validators from Zod to Yup

- From: planner (sub-agent)
- To: Root Agent
- Title: Plan Response — Migrate livekit-server validators from Zod to Yup
- Description: Replace the single Zod validator in `apps/livekit-server` with a Yup equivalent, updating `package.json` accordingly.

---

## Approach Summary

Only 2 files need to change. The single validator file is rewritten to use Yup APIs, and `package.json` has `zod` removed and `yup` added. All exported names (`getLiveKitTokenSchema`, `GetLiveKitTokenBody`, `validateGetLiveKitToken`) are preserved — downstream consumers are unaffected.

## Functional Requirements

- All optional string fields validated with `yup.string().optional()`
- `participantAttributes` validated as an object whose values are all strings (custom `.test()`)
- `roomConfig` accepts any value via `yup.mixed().optional()`
- Type `GetLiveKitTokenBody` inferred via Yup's `InferType<typeof schema>`
- Middleware remains synchronous using `validateSync` (not async `validate`)
- 422 error propagated on validation failure with the Yup error message
- `zod` removed from `package.json`; `yup ^1.6.1` added

## Non-Functional Requirements

- `verbatimModuleSyntax: true` — `import type { InferType }` separated from `import * as yup`
- `exactOptionalPropertyTypes: true` — optional fields infer as `T | undefined`, matching prior Zod behavior
- `stripUnknown: true` passed to `validateSync` to match Zod's default behavior of dropping unrecognized keys
- No `@types/yup` needed (Yup 1.x ships its own types)

## Files in Scope

- `apps/livekit-server/src/validators/get-livekit-token.validator.ts` — Full rewrite (Zod → Yup)
- `apps/livekit-server/package.json` — Remove `zod`, add `yup ^1.6.1`

## Risks & Assumptions

- `yup.mixed().optional()` infers as `{} | undefined`; downstream usage of `roomConfig` is a truthy check — no type change needed
- `stripUnknown: true` added to match Zod's default unknown-key stripping behavior
- No tests required (Testing Workflow: `Skip-Testing`)

## Open Questions / Blockers

None.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                                                                      | Responsible Role | Dependencies |
| --- | ------ | ----------------------------------------------------------------------------------------- | ---------------- | ------------ |
| 1   | DONE   | Remove `zod`, add `yup ^1.6.1` in `package.json`                                          | developer        | none         |
| 2   | DONE   | Rewrite `get-livekit-token.validator.ts` with Yup schema, type inference, sync middleware | developer        | none         |
| 3   | DONE   | Run `pnpm install` to update the lockfile                                                 | developer        | 1, 2         |
| 4   | DONE   | Run `pnpm livekit-server typecheck` and `pnpm livekit-server lint` to verify              | developer        | 3            |
