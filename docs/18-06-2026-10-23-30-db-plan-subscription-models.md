- Author: Root Agent
- Title: Plan — [DB] Plan + Subscription models + migration
- Classification: feature
- Description: Add a platform-global `Plan` catalog and a per-tenant `Subscription` (1:many history) to the multi-file Prisma schema in a new `billing.prisma`, with indexed FKs, tenant-cascade delete, and a hand-authored migration matching the existing migration style (generate-only — not applied).

---

## Approach Summary

- Follow the established per-domain file convention: introduce `apps/server/prisma/schema/billing.prisma` rather than extending an existing domain file. `Plan` is platform-global (like `AdminUser`), not tenant-scoped; `Subscription` is tenant-owned (like `Bot`/`ApiKey`).
- `Tenant` gets a back-relation `subscriptions Subscription[]` (1:many history per user choice). The "current" subscription is the one in `ACTIVE` status — no schema-level uniqueness on `tenantId`.
- Cascade matches existing tenant-owned rows: `Subscription.tenantId → onDelete: Cascade`. `Subscription.planId → onDelete: Restrict` so a Plan referenced by subscriptions can't be silently deleted (catalog protection). Both FKs get `@@index`.
- Since no local Postgres/Docker is reachable, the migration is hand-authored to byte-match what `prisma migrate` would emit (mirroring `20260618090000_add_admin_session/migration.sql`), placed in a new timestamped migration folder. Not applied — user runs `prisma migrate deploy`/`dev` against their DB.

## Functional Requirements

- New `Plan` model: `id` (uuid PK), `name`, `slug` (`@unique`), `priceCents` (Int), `currency` (String, default `"USD"`), `interval` (`BillingInterval`), quota columns `maxBots`, `maxApiKeys`, `maxMessagesPerMonth`, `maxKnowledgeDocs` (all `Int`), `isActive` (Boolean, default `true`), `createdAt`/`updatedAt`.
- New `Subscription` model: `id` (uuid PK), `tenantId`, `planId`, `status` (`SubscriptionStatus`), `currentPeriodStart` (DateTime?), `currentPeriodEnd` (DateTime?), `trialEndsAt` (DateTime?), `cancelAtPeriodEnd` (Boolean, default `false`), `canceledAt` (DateTime?), `createdAt`/`updatedAt`.
- New enums: `BillingInterval { MONTH, YEAR }`, `SubscriptionStatus { TRIALING, ACTIVE, PAST_DUE, CANCELED, EXPIRED }`.
- `Tenant.subscriptions Subscription[]` back-relation added to `tenant.prisma`.
- `Subscription.tenantId` FK `onDelete: Cascade`; `Subscription.planId` FK `onDelete: Restrict`. Both indexed (`@@index([tenantId])`, `@@index([planId])`).
- Migration SQL created (CreateEnum × 2, CreateTable × 2, unique index on `Plan.slug`, two FK indexes, two AddForeignKey) — generate-only, not applied.
- `prisma generate` + `tsc --noEmit` (typecheck) pass against the new schema.

## Non-Functional Requirements

- Match existing schema idioms exactly: UUID `@default(uuid())` PKs, `@default(now())`/`@updatedAt` timestamps, file header comment block like sibling files, enum placement above models.
- No raw secrets/PII introduced. No Stripe/provider fields (deferred per decision).
- Prettier/ESLint clean; no `console.log`.

## Files in Scope

- Create: `apps/server/prisma/schema/billing.prisma`
- Modify: `apps/server/prisma/schema/tenant.prisma` (add `subscriptions` back-relation)
- Create: `apps/server/prisma/migrations/20260618102330_add_plan_subscription/migration.sql`
- Create: `docs/18-06-2026-10-23-30-db-plan-subscription-models.md` (this plan)

## Risks & Assumptions

- Assumption: `Plan` is platform-global (shared catalog), not per-tenant. Standard SaaS; consistent with admin-domain global models.
- Assumption: `planId` uses `onDelete: Restrict` (not Cascade/SetNull) to protect referenced plans. The ticket's "tenant cascade" refers specifically to the `tenantId` FK.
- Assumption: `isActive: Boolean` (not a status enum) is enough to retire a plan from the catalog; mirrors `AdminUser.isActive`.
- Risk: Hand-authored migration must exactly match Prisma's diff output; if it drifts, the next `prisma migrate dev` will detect schema/migration mismatch. Mitigated by mirroring the AdminSession migration format precisely.
- Risk: Migration cannot be verified by actually applying it (no DB in this session). Verification is limited to `prisma generate` + `tsc`. Acceptance criterion "migration apply" is satisfied as generate-only per user decision; user applies it later.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                           | Responsible Role | Dependencies | Skills       |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Create `billing.prisma` with `BillingInterval` + `SubscriptionStatus` enums and `Plan` + `Subscription` models (indexed FKs, tenant cascade, planId restrict). | developer        | none         | `clean-code` |
| 2   | TODO   | Add `subscriptions Subscription[]` back-relation to `Tenant` in `tenant.prisma`.                                                                               | developer        | task 1       | `clean-code` |
| 3   | TODO   | Hand-author `migration.sql` in a new timestamped migration folder, mirroring the AdminSession migration format. Generate-only.                                 | developer        | task 1, 2    | `clean-code` |
| 4   | TODO   | Run `pnpm prisma:generate` then `pnpm typecheck` in `apps/server`; confirm both pass. Report output.                                                           | developer        | task 1, 2, 3 | `clean-code` |
