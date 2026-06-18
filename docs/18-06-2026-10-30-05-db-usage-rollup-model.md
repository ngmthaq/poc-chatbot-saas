- Author: Root Agent
- Title: Plan — [DB] `UsageRollup` model + migration
- Classification: feature
- Description: Add a tenant-scoped `UsageRollup` aggregate model to the existing `billing.prisma`, with a rerun-safe unique `(tenantId, periodStart)`, indexed tenant FK, tenant-cascade delete, and a hand-authored generate-only migration matching the established style.

---

## Approach Summary

- `UsageRollup` is a per-tenant, per-period usage aggregate (the scheduled rollup target for `ApiKeyUsage` → `UsageRollup`, per the master spec's roadmap). It belongs to the billing domain, so it goes in the existing `apps/server/prisma/schema/billing.prisma` alongside `Plan`/`Subscription` rather than a new file.
- Field set is taken verbatim from the master spec (`docs/17-06-2026-16-13-46-multi-tenant-saas-chatbot-platform.md` §#3): `id, tenantId, periodStart, periodEnd, requestCount, voiceMinutes, createdAt` — plus `updatedAt` (user decision, for rerun upserts).
- The unique `@@unique([tenantId, periodStart])` enforces rerun-safety (idempotent upsert key). `Tenant.usageRollups` back-relation added; `tenantId` FK `onDelete: Cascade` (consistent with all tenant-owned rows).
- Generate-only migration hand-authored to byte-match Prisma's diff output, mirroring the AdminSession/Plan-Subscription migration format. Not applied (no DB in session).

## Functional Requirements

- New `UsageRollup` model: `id` (uuid PK), `tenantId`, `periodStart` (DateTime), `periodEnd` (DateTime), `requestCount` (Int, `@default(0)`), `voiceMinutes` (`Decimal`, `@default(0)`), `createdAt` (`@default(now())`), `updatedAt` (`@updatedAt`).
- `tenant Tenant @relation(fields: [tenantId], references: [id], onDelete: Cascade)`.
- `@@unique([tenantId, periodStart])` — rerun-safe constraint.
- `@@index([tenantId])` — matches the existing convention (`ApiKeyUsage`/`EndUser` both carry a standalone tenant/owner index alongside their composite unique).
- `Tenant.usageRollups UsageRollup[]` back-relation added.
- Migration SQL: `CreateTable` + unique index `UsageRollup_tenantId_periodStart_key` + `CreateIndex` `UsageRollup_tenantId_idx` + `AddForeignKey` (tenant, `ON DELETE CASCADE ON UPDATE CASCADE`).
- `prisma generate` + `tsc --noEmit` pass.

## Non-Functional Requirements

- Match existing schema idioms exactly (UUID PK, timestamps, domain header comment already present in `billing.prisma`).
- `Decimal` chosen for `voiceMinutes` → SQL `DECIMAL(65,30)` (Prisma default precision) — exact, billing-safe (#4 Invoice depends on this).
- No secrets/PII. Prettier/ESLint clean.

## Files in Scope

- Modify: `apps/server/prisma/schema/billing.prisma` (add `UsageRollup` model)
- Modify: `apps/server/prisma/schema/tenant.prisma` (add `usageRollups` back-relation)
- Create: `apps/server/prisma/migrations/20260618103005_add_usage_rollup/migration.sql`
- Create: `docs/18-06-2026-10-30-05-db-usage-rollup-model.md` (this plan)

## Risks & Assumptions

- Assumption: `requestCount` and `voiceMinutes` default to `0` (sensible for an accumulating counter; spec doesn't state defaults).
- Assumption: `UsageRollup` lives in `billing.prisma` (billing domain) — not a new file.
- Assumption: standalone `@@index([tenantId])` is included to match the existing codebase pattern, even though the composite unique already leads with `tenantId` (technically redundant for lookups). Flagged so user can drop it if leaner indexes are preferred.
- Risk: hand-authored migration must match Prisma's diff exactly; mitigated by mirroring prior migrations and validating via `prisma generate`. Not applied this session (generate-only).

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                           | Responsible Role | Dependencies | Skills       |
| --- | ------ | ------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------ | ------------ |
| 1   | TODO   | Add `UsageRollup` model to `billing.prisma` (fields per spec + `Decimal voiceMinutes`, tenant Cascade, `@@unique`, `@@index`). | developer        | none         | `clean-code` |
| 2   | TODO   | Add `usageRollups UsageRollup[]` back-relation to `Tenant` in `tenant.prisma` (additive only).                                 | developer        | task 1       | `clean-code` |
| 3   | TODO   | Hand-author `migration.sql` in `20260618103005_add_usage_rollup/`, mirroring prior migration format. Generate-only.            | developer        | task 1, 2    | `clean-code` |
| 4   | TODO   | Run `pnpm prisma:generate` then `pnpm typecheck` in `apps/server`; confirm both pass. Report verbatim output.                  | developer        | task 1, 2, 3 | `clean-code` |
