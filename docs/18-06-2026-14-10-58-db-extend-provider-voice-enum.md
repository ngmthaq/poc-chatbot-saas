- Author: Root Agent
- Title: Plan — [DB] Extend `Provider` enum for voice providers + migration
- Classification: feature
- Description: Additively extend the Prisma `Provider` enum in `bot.prisma` with the 12 missing voice-registry values, via an `ALTER TYPE ... ADD VALUE` migration that leaves existing rows untouched; generate-only.

---

## Approach Summary

- The Prisma `Provider` enum (currently `OPENAI, MISTRAL, ANTHROPIC`) gains the values present in the livekit-agent registry but absent from the DB enum: `INFERENCE, GOOGLE, DEEPGRAM, ELEVEN, CARTESIA, NEUPHONIC, RESEMBLE, RIME, INWORLD, XAI, FISH, HUME` (12 values, user "full registry incl. INFERENCE" choice). `OPENAI`/`MISTRAL` already exist; `ANTHROPIC` stays (chat provider).
- New values are appended after the existing three, preserving their ordinal positions — so existing `Bot.provider` rows are unaffected (criterion). The migration uses Postgres `ALTER TYPE "Provider" ADD VALUE '…'` per value, which is exactly what `prisma migrate` emits for enum additions.
- Because this adds more than one value, the migration must include Prisma's standard PG≤11 warning comment block (byte-matching what the CLI generates, to avoid drift detection).
- The `bot.prisma` header comment (which currently says the enum mirrors only the deepagent LLM `ProviderType`) is updated to note it now also covers the livekit-agent voice registry. Generate-only — not applied.

## Functional Requirements

- `Provider` enum in `apps/server/prisma/schema/bot.prisma` lists, in order: `OPENAI, MISTRAL, ANTHROPIC, INFERENCE, GOOGLE, DEEPGRAM, ELEVEN, CARTESIA, NEUPHONIC, RESEMBLE, RIME, INWORLD, XAI, FISH, HUME`.
- Migration `migration.sql` contains the `-- AlterEnum` warning block + one `ALTER TYPE "Provider" ADD VALUE '<X>';` per new value (12 statements), in append order. No statements touching existing values or rows.
- Additive only — no `DROP`, no table rewrite, no data change.
- `prisma validate` passes (explicit ticket criterion), `prisma generate` succeeds, `tsc --noEmit` passes.

## Non-Functional Requirements

- Migration byte-matches Prisma's enum-addition output format (warning comment + ALTER statements).
- No secrets/PII. Prettier/ESLint clean. Comment updated for accuracy only.

## Files in Scope

- Modify: `apps/server/prisma/schema/bot.prisma` (extend `Provider` enum + update header comment)
- Create: `apps/server/prisma/migrations/20260618141058_extend_provider_voice/migration.sql`
- Create: `docs/18-06-2026-14-10-58-db-extend-provider-voice-enum.md` (this plan)

## Risks & Assumptions

- Assumption: new values appended after existing ones (not interleaved) — required to keep existing rows' enum ordinals stable and satisfy "existing rows unaffected."
- Assumption: including `INFERENCE` as a selectable provider value is intended (user choice).
- Note (not a blocker): `Bot.provider` is the only consumer of this enum and no exhaustive `switch` exists, so adding values is non-breaking at the TS layer (verified during brainstorming).
- Risk: if a future Postgres target is ≤11, multi-value enum additions can't run in one transaction — mitigated by the standard Prisma warning comment; current target is PG (12+ assumed). Generate-only this session.

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                     | Responsible Role | Dependencies | Skills       |
| --- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Extend the `Provider` enum in `bot.prisma` with the 12 voice values (appended) and update the header comment to mention the voice registry.              | developer        | none         | `clean-code` |
| 2   | TODO   | Hand-author `migration.sql` in `20260618141058_extend_provider_voice/` with the `-- AlterEnum` warning block + 12 `ADD VALUE` statements. Generate-only. | developer        | task 1       | `clean-code` |
| 3   | TODO   | Run `pnpm prisma:generate`, `pnpm exec prisma validate`, and `pnpm typecheck` in `apps/server`; confirm all pass. Report verbatim output.                | developer        | task 1, 2    | `clean-code` |
