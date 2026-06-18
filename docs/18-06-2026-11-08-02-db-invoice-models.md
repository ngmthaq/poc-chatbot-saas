- Author: Root Agent
- Title: Plan — [DB] `Invoice` + `InvoiceLineItem` models + migration
- Classification: feature
- Description: Add tenant-scoped `Invoice` and child `InvoiceLineItem` models to `billing.prisma`, with `InvoiceStatus` enum, Decimal money, rerun-safe unique `(tenantId, periodStart)`, indexed FKs, tenant-cascade and invoice→line-item cascade, plus a hand-authored generate-only migration.

---

## Approach Summary

- Billing domain → both models go in the existing `apps/server/prisma/schema/billing.prisma`, alongside `Plan`/`Subscription`/`UsageRollup`.
- `Invoice` is tenant-owned (one per tenant per billing period — enforced by `@@unique([tenantId, periodStart])` so generation #83 is idempotent). `InvoiceLineItem` is the breakdown (one row per billed component, e.g. requests, voice minutes), `onDelete: Cascade` from its parent invoice — satisfying the "cascade invoice→line items" criterion.
- Money as `Decimal` (user decision) → SQL `DECIMAL(65,30)`; `total` aggregates the line items' `amount`. Generation logic (#83) is out of scope — this is schema only.
- `Tenant` gets `invoices Invoice[]`; `Invoice.tenantId` FK `onDelete: Cascade` (consistent). Generate-only migration hand-authored to match prior migration format. Not applied.

## Functional Requirements

- New enum `InvoiceStatus { DRAFT, ISSUED, PAID, VOID }`.
- New `Invoice` model: `id` (uuid PK), `tenantId`, `periodStart` (DateTime), `periodEnd` (DateTime), `total` (`Decimal`, `@default(0)`), `currency` (String, `@default("USD")`), `status` (`InvoiceStatus`, `@default(DRAFT)`), `issuedAt` (DateTime?), `paidAt` (DateTime?), `createdAt` (`@default(now())`), `updatedAt` (`@updatedAt`).
  - `tenant Tenant @relation(... onDelete: Cascade)`, `lineItems InvoiceLineItem[]`.
  - `@@unique([tenantId, periodStart])`, `@@index([tenantId])`.
- New `InvoiceLineItem` model: `id` (uuid PK), `invoiceId`, `description` (String), `quantity` (`Decimal`), `unitAmount` (`Decimal`), `amount` (`Decimal`), `createdAt` (`@default(now())`).
  - `invoice Invoice @relation(... onDelete: Cascade)`.
  - `@@index([invoiceId])`.
- `Tenant.invoices Invoice[]` back-relation added.
- Migration SQL: `CreateEnum` (InvoiceStatus) → `CreateTable` Invoice → `CreateTable` InvoiceLineItem → indexes (Invoice unique, Invoice tenant, line-item invoice) → `AddForeignKey` x2 (Invoice→Tenant CASCADE, InvoiceLineItem→Invoice CASCADE).
- `prisma generate` + `tsc --noEmit` pass.

## Non-Functional Requirements

- Match existing schema idioms (UUID PK, timestamps, enum above models, field alignment). No new file header (billing.prisma already has one).
- `Decimal` for all money — billing-exact, consistent with the `voiceMinutes` precedent.
- No secrets/PII. Prettier/ESLint clean.

## Files in Scope

- Modify: `apps/server/prisma/schema/billing.prisma` (add `InvoiceStatus`, `Invoice`, `InvoiceLineItem`)
- Modify: `apps/server/prisma/schema/tenant.prisma` (add `invoices` back-relation)
- Create: `apps/server/prisma/migrations/20260618110802_add_invoice/migration.sql`
- Create: `docs/18-06-2026-11-08-02-db-invoice-models.md` (this plan)

## Risks & Assumptions

- Assumption: `Invoice.currency` (default `"USD"`) and lifecycle timestamps `issuedAt`/`paidAt` are included beyond the spec's literal `(id, tenantId, periodStart, periodEnd, total, status)` — natural for status transitions and currency-correctness. Approved at the gate.
- Assumption: `InvoiceLineItem` shape is `description / quantity / unitAmount / amount` (generic enough for "requests" and "voice-minutes" lines; `amount = quantity × unitAmount`, `Invoice.total = Σ amount` — enforced by generation logic #83, not the DB).
- Assumption: No `planId` snapshot FK on `Invoice` — the line items carry the breakdown; keeps scope to the spec.
- Risk: hand-authored migration must match Prisma's diff exactly; mitigated by mirroring prior migrations + `prisma generate` validation. Generate-only (not applied this session).

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                               | Responsible Role | Dependencies | Skills       |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Add `InvoiceStatus` enum + `Invoice` model + `InvoiceLineItem` model to `billing.prisma` (Decimal money, unique, indexes, both cascades) per spec. | developer        | none         | `clean-code` |
| 2   | TODO   | Add `invoices Invoice[]` back-relation to `Tenant` in `tenant.prisma` (additive only).                                                             | developer        | task 1       | `clean-code` |
| 3   | TODO   | Hand-author `migration.sql` in `20260618110802_add_invoice/`, mirroring prior migration format. Generate-only.                                     | developer        | task 1, 2    | `clean-code` |
| 4   | TODO   | Run `pnpm prisma:generate` then `pnpm typecheck` in `apps/server`; confirm both pass. Report verbatim output.                                      | developer        | task 1, 2, 3 | `clean-code` |
