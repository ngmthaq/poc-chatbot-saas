- Author: Root Agent
- Title: Plan — Tenant CRUD Admin APIs (#20–24)
- Classification: feature
- Description: Add an admin-guarded `/admin/tenants` vertical slice (route → controller → service → validator) implementing create/list/get/update/soft-archive, plus a tenant-status guard in `verifyKey` so archived/suspended tenants' keys stop authenticating.

---

## Approach Summary

- Mirror the existing `admin-auth` vertical slice exactly: a yup validator, a `TenantService` (Prisma singleton, returns `null` for not-found), a thin `TenantController` (translates `null`/conflicts to `http-errors`), and a `tenant.route.ts` mounted at `/admin/tenants` behind the existing `adminAuth()` guard.
- Soft-delete sets `status=ARCHIVED`; enforcement of "archived keys stop authenticating" is centralized by adding a `tenant.status === ACTIVE` check inside `ApiKeyService.verifyKey`, which also covers `SUSPENDED`.
- Response envelope and `responseHandler` are reused throughout.

## Functional Requirements

- **#20 `POST /admin/tenants`** — body `{name, slug}` → **201** `{tenant}`; **409** duplicate slug; **422** invalid body (schema).
- **#21 `GET /admin/tenants`** — `?page&limit&search` → **200** `{items, total}`; empty → `items: []`.
- **#22 `GET /admin/tenants/:id`** — **200** `{tenant, counts}` (bots/apiKeys/conversations/endUsers via `_count`); **404** unknown.
- **#23 `PATCH /admin/tenants/:id`** — body `{name?, slug?, status?}` → **200** updated; **409** slug conflict; **404** unknown.
- **#24 `DELETE /admin/tenants/:id`** — soft-archive (`status=ARCHIVED`) → **204**; **404** unknown; archived/suspended tenant's keys fail auth afterward.
- All five endpoints require a valid admin access token (`adminAuth()` → **401**).

## Non-Functional Requirements

- Follow layering (route→controller→service→utils), kebab-case `*.role.ts` naming, types in `src/types/*.d.ts` (never inline), extensionless ESM imports.
- Prisma singleton only; no secret/PII logging; slug uniqueness enforced at DB level (handle `P2002`).
- `verifyKey` change must not add latency beyond a single join and must not break auth for ACTIVE-tenant keys.

## Files in Scope

- **Create:** `src/validators/tenant.validator.ts`, `src/services/tenant.service.ts`, `src/controllers/tenant.controller.ts`, `src/routes/tenant.route.ts`, `src/types/tenant.d.ts`
- **Modify:** `src/routes/index.ts` (mount `/admin/tenants`), `src/configs/error-messages.ts` (`tenantNotFound()`, `slugConflict()`), `src/services/api-key.service.ts` (`verifyKey` tenant-status guard), `src/validators/index.ts` (if it barrel-exports validators)

## Risks & Assumptions

- **Assumption:** DELETE returns a true **204** (no envelope body) via `res.status(204).end()` inside the controller (responseHandler no-ops on `headersSent`); POST 201 keeps the JSON envelope. This is the only deviation from the uniform envelope, made to honor the ticket's status codes.
- **Assumption:** Pagination defaults `page=1, limit=20` (max 100); `search` matches `name`/`slug` (case-insensitive `contains`).
- **Assumption:** Slug format = lowercase `^[a-z0-9]+(?:-[a-z0-9]+)*$`; invalid → 422 (schema), per the "keep 422 convention" decision.
- **Risk:** `verifyKey` change touches the hot auth path for every API-key request. Mitigation: single `include: { tenant }`, strip tenant before returning `ApiKey`, and only reject non-`ACTIVE` tenants.

## Open Questions / Blockers

- None — all resolved in brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                | Responsible Role | Dependencies | Skills                           |
| --- | ------ | --------------------------------------------------------------------------------------------------- | ---------------- | ------------ | -------------------------------- |
| 1   | DONE   | Create `tenant.validator.ts` (create/update/list-query yup schemas + inferred body types)           | developer        | none         | `clean-code`                     |
| 2   | DONE   | Create `tenant.d.ts` result types (tenant-with-counts, paginated list)                              | developer        | none         | `clean-code`                     |
| 3   | DONE   | Add `tenantNotFound()` + `slugConflict()` to `error-messages.ts`                                    | developer        | none         | `clean-code`                     |
| 4   | DONE   | Create `TenantService` (create/list/getByIdWithCounts/update/archive; null-for-404; P2002→conflict) | developer        | 2,3          | `clean-code`                     |
| 5   | DONE   | Create `TenantController` (5 handlers; 201/204/404/409 mapping)                                     | developer        | 1,4          | `clean-code`                     |
| 6   | DONE   | Create `tenant.route.ts` + mount `/admin/tenants` behind `adminAuth()` in `routes/index.ts`         | developer        | 5            | `clean-code`                     |
| 7   | DONE   | Add tenant-status guard to `ApiKeyService.verifyKey` (#24 key cutoff)                               | developer        | 3            | `clean-code`, `security-scanner` |

> Testing Workflow is **Skip-Testing**, so no tester sub-agent is spawned; acceptance is verified via the Root Agent review (typecheck/lint + code inspection) at Step 6.
