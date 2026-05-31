# Plan Response — Refactor `validators/` to schema-only; create `request-validator` middleware

- From: planner (sub-agent)
- To: Root Agent
- Title: Plan Response — Refactor `validators/` to schema-only; create `request-validator` middleware
- Description: Strip all RequestHandler logic from `validators/` (leaving only yup schemas + types), then create a generic factory middleware in `middlewares/` that handles body/params/query/headers validation with optional pre-validate data preparation.

---

## Approach Summary

The current `get-livekit-token.validator.ts` violates SRP — it owns both the yup schema and the Express `RequestHandler` wiring. The plan separates those concerns: `validators/` becomes schema-only, and a new `requestValidator` factory in `middlewares/` owns the full validation lifecycle (extract → prepare → validate → write back → error forward). The factory is generic enough to handle any of the four request targets via a `target` discriminant, making it reusable for future routes.

## Functional Requirements

- `validators/` files export only yup schemas + `InferType` types — no `RequestHandler`, no `humps`, no `http-errors`
- `request-validator.middleware.ts` exports a `requestValidator(options)` factory returning a `RequestHandler`
- Options shape: `{ target: 'body' | 'params' | 'query' | 'headers', schema: AnyObjectSchema, prepare?: (data: unknown) => unknown }`
- Validation uses `validateSync({ abortEarly: true, stripUnknown: true })`
- `yup.ValidationError` → `next(createHttpError(422, err.message))`
- Any other error → `next(err)`
- `livekit.route.ts` updated to use the new factory with `prepare: humps.camelizeKeys`

## Non-Functional Requirements

- Compiles under `strict: true`, `exactOptionalPropertyTypes`, `noUncheckedIndexedAccess`, `verbatimModuleSyntax`
- `import type` used for all type-only imports
- No `as any` casts — write-back uses `(req as Record<string, unknown>)[options.target]`
- Barrel `index.ts` added for both `validators/` and `middlewares/` directories

## Files in Scope

| Action | File                                                                  |
| ------ | --------------------------------------------------------------------- |
| Modify | `apps/livekit-server/src/validators/get-livekit-token.validator.ts`   |
| Create | `apps/livekit-server/src/middlewares/request-validator.middleware.ts` |
| Modify | `apps/livekit-server/src/routes/livekit.route.ts`                     |
| Create | `apps/livekit-server/src/validators/index.ts`                         |
| Create | `apps/livekit-server/src/middlewares/index.ts`                        |

## Risks & Assumptions

- `req[target]` write-back requires a cast to `(req as Record<string, unknown>)` — minimally unsound but necessary given Express's mixed body/params/query/headers types
- `humps.camelizeKeys` type compatibility — may require an inline arrow wrapper at the call site: `prepare: (d) => humps.camelizeKeys(d as object)` if TypeScript rejects the direct reference
- No test runner exists — Task 6 (unit tests) is flagged but requires adding vitest or similar as a dev dependency; included as optional

## Open Questions / Blockers

None.

## Status

- [x] Ready to execute

## Task List

| #   | Status  | Task                                                                                 | Responsible Role | Dependencies |
| --- | ------- | ------------------------------------------------------------------------------------ | ---------------- | ------------ |
| 1   | DONE    | Strip `get-livekit-token.validator.ts` to schema + type only                         | developer        | none         |
| 2   | DONE    | Create `middlewares/request-validator.middleware.ts` with `requestValidator` factory | developer        | none         |
| 3   | DONE    | Update `routes/livekit.route.ts` to use `requestValidator` factory                   | developer        | 1, 2         |
| 4   | DONE    | Create `validators/index.ts` barrel export                                           | developer        | 1            |
| 5   | DONE    | Create `middlewares/index.ts` barrel export                                          | developer        | 2            |
| 6   | SKIPPED | Write unit tests for `request-validator.middleware.ts` — no test runner in project   | tester           | 2            |
