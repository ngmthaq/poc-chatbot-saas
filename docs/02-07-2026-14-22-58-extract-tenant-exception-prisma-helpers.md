- Author: Root Agent
- Title: Plan — Extract tenant exception + Prisma error helpers
- Classification: feature (refactor)
- Description: Move `TenantSlugConflictError` into a domain-grouped exceptions folder and move the two Prisma error-narrowing helpers into `prisma.utils.ts`; pure refactor, no behavior change.

---

## Approach Summary

- Extract the `TenantSlugConflictError` class and the `isUniqueViolation`/`isRecordNotFound` helpers out of `tenant.service.ts` into shared homes, then rewire imports. Moved code is verbatim.

## Files in Scope

- **Create:** `src/exceptions/tenant.exception.ts` (holds `TenantSlugConflictError`), `src/exceptions/index.ts` (barrel)
- **Modify:** `src/utils/prisma.utils.ts` (add exported `isUniqueViolation`/`isRecordNotFound` + `Prisma` value import), `src/services/tenant.service.ts` (delete moved defs, import from new locations; keep `Prisma` for `TenantWhereInput`), `src/controllers/tenant.controller.ts` (import `TenantSlugConflictError` from `../exceptions`)

## Risks & Assumptions

- Helpers become app-wide utilities in `prisma.utils.ts` (intended — reusable by future bot/key services).
- Exception layout = domain-grouped + barrel (user decision); import path `../exceptions`.

## Status

- [x] Ready to execute

## Task List

| #   | Status | Task                                                                                    | Responsible Role | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------- | ---------------- | ------------ |
| 1   | DONE   | Create `exceptions/tenant.exception.ts` + `exceptions/index.ts` barrel                  | developer        | `clean-code` |
| 2   | DONE   | Add exported `isUniqueViolation` + `isRecordNotFound` (with JSDoc) to `prisma.utils.ts` | developer        | `clean-code` |
| 3   | DONE   | Update `tenant.service.ts` — delete moved defs, import from new locations               | developer        | `clean-code` |
| 4   | DONE   | Update `tenant.controller.ts` import to `../exceptions`                                 | developer        | `clean-code` |

> Testing Workflow is **Skip-Testing**; acceptance verified via Root Agent review (typecheck + lint pass clean, verbatim-move confirmed by grep).
