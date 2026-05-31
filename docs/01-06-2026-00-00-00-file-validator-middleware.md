# Plan Response — File Validator Middleware

- From: planner
- To: Root Agent
- Title: Plan Response — File Validator Middleware
- Description: Implement `file-validator.middleware.ts` as a factory-function middleware that validates `req.files` against `maxFiles`, `maxFileSize`, `totalFileSize`, and `fileExtension` constraints, following the established middleware pattern.

---

## Approach Summary

The middleware follows the exact same factory-function pattern as `request-validator.middleware.ts`: a named export `fileValidator(options: FileValidatorOptions)` that returns an Express `RequestHandler`. At runtime it reads `req.files`, normalises it to a flat `Express.Multer.File[]` (covering both the array form and the fields-map form), then runs each configured constraint in sequence. Any violation calls `next(createHttpError(400, message))`. If all checks pass it calls `next()` unchanged.

Because `multer` is not currently installed in the project, it must be added (along with its `@types` companion) before the middleware can compile. This is a hard prerequisite.

## Functional Requirements

1. **FR-1 — Factory signature**: `fileValidator(options: FileValidatorOptions): RequestHandler`
2. **FR-2 — Options type**: `FileValidatorOptions` with four optional constraint fields:
   - `maxFiles?: number` — maximum count of uploaded files
   - `maxFileSize?: number` — maximum size of any single file, in bytes
   - `totalFileSize?: number` — maximum combined size of all files, in bytes
   - `fileExtension?: string[]` — allowlist of permitted extensions, each with a leading dot (e.g. `['.jpg', '.png']`)
3. **FR-3 — File source normalisation**: handle both `req.files` as `Express.Multer.File[]` (single-field) and `Record<string, Express.Multer.File[]>` (multi-field), producing a flat array for uniform validation.
4. **FR-4 — Guard for no files**: if `req.files` is undefined or empty, call `next(createHttpError(400, 'No files uploaded'))`.
5. **FR-5 — maxFiles check**: if `files.length > maxFiles`, call `next(createHttpError(400, 'Too many files: maximum {maxFiles} allowed'))`.
6. **FR-6 — maxFileSize check**: iterate files; if any `file.size > maxFileSize`, call `next(createHttpError(400, 'File "{file.originalname}" exceeds the maximum size of {maxFileSize} bytes'))`.
7. **FR-7 — totalFileSize check**: sum all `file.size`; if sum `> totalFileSize`, call `next(createHttpError(400, 'Total upload size exceeds the maximum of {totalFileSize} bytes'))`.
8. **FR-8 — fileExtension check**: for each file derive `path.extname(file.originalname).toLowerCase()`; if the result is not in the lowercased allowlist, call `next(createHttpError(400, 'File "{file.originalname}" has an unsupported extension'))`.
9. **FR-9 — Fail-fast**: checks run in order (no-files → count → single size → total size → extension); the first failure short-circuits via `next(err)` and subsequent checks are skipped.
10. **FR-10 — Barrel export**: `fileValidator` and `FileValidatorOptions` exported from `middlewares/index.ts`.

## Non-Functional Requirements

- NFR-1: Strict TypeScript compatibility (`strict`, `exactOptionalPropertyTypes`, `noImplicitReturns`, `verbatimModuleSyntax`).
- NFR-2: Use `import type` for all type-only imports (`RequestHandler`, `FileValidatorOptions` when re-exported).
- NFR-3: Zero new runtime dependencies beyond `multer` / `@types/multer`.
- NFR-4: Import `node:path` (ESM-safe).
- NFR-5: All constraint fields are optional; omitting a field disables that check.
- NFR-6: `exactOptionalPropertyTypes` means optional fields must be accessed with `!== undefined` guards.

## Files in Scope

| File                                                               | Action | Notes                                                                    |
| ------------------------------------------------------------------ | ------ | ------------------------------------------------------------------------ |
| `apps/livekit-server/package.json`                                 | Modify | Add `multer` to `dependencies`, add `@types/multer` to `devDependencies` |
| `apps/livekit-server/src/middlewares/file-validator.middleware.ts` | Create | New middleware file                                                      |
| `apps/livekit-server/src/middlewares/index.ts`                     | Modify | Add barrel exports for `fileValidator` and `FileValidatorOptions`        |

## Risks & Assumptions

- ASSUMPTION-1: File upload routes will use `multer` middleware upstream of `fileValidator`.
- ASSUMPTION-2: All size values are in bytes.
- ASSUMPTION-3: `fileExtension` allowlist check is case-insensitive.
- ASSUMPTION-4: `node:path` used for `extname`.

## Open Questions / Blockers

None — all resolved by user.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                                                                                                                                                           | Responsible Role | Dependencies | Skills     |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | ---------- |
| 1   | DONE   | Add `multer` to `dependencies` and `@types/multer` to `devDependencies` in `apps/livekit-server/package.json`, then run `pnpm install`                                         | developer        | none         | —          |
| 2   | DONE   | Create `apps/livekit-server/src/middlewares/file-validator.middleware.ts` with `FileValidatorOptions` type and `fileValidator` factory function implementing FR-1 through FR-9 | developer        | Task 1       | clean-code |
| 3   | DONE   | Add `fileValidator` and `export type { FileValidatorOptions }` to `apps/livekit-server/src/middlewares/index.ts` barrel                                                        | developer        | Task 2       | —          |
| 4   | DONE   | Run `pnpm typecheck` (or `pnpm build`) in `apps/livekit-server` to verify compilation                                                                                          | developer        | Task 3       | —          |
