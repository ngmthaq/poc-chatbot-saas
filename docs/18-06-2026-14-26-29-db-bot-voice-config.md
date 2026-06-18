- Author: Root Agent
- Title: Plan — [DB] Add voice config fields to `Bot` + migration
- Classification: feature
- Description: Additively add four voice-config columns (`voiceEnabled`, `stt`, `tts`, `voiceId`) to the `Bot` model in `bot.prisma`, backed by a hand-authored `ALTER TABLE ... ADD COLUMN` migration; `voiceEnabled` defaults to `false` so existing bots stay text-only. Generate-only.

---

## Approach Summary

- Add to `Bot`: `voiceEnabled Boolean @default(false)`, `stt Provider?`, `tts Provider?`, `voiceId String?`. STT/TTS reuse the `Provider` enum just extended (migration `20260618141058`) to cover the livekit-agent voice registry — type-safe and consistent with the existing `provider` column.
- All four are additive and nullable/defaulted, so existing `Bot` rows are unaffected: `voiceEnabled` backfills to `false` (text-only), and `stt`/`tts`/`voiceId` backfill to `NULL`. This satisfies the "existing bots text-only" criterion without a data migration.
- The migration is hand-authored to byte-match Prisma's `AddColumn` output (one `ALTER TABLE "Bot" ADD COLUMN` per field). Generate-only — schema + migration file + validate/generate/typecheck, no `migrate deploy`.
- The `bot.prisma` header comment is extended to note the Bot now carries optional voice (STT/TTS) config alongside its LLM config.

## Functional Requirements

- `Bot` model in `apps/server/prisma/schema/bot.prisma` gains exactly: `voiceEnabled Boolean @default(false)`, `stt Provider?`, `tts Provider?`, `voiceId String?`.
- `migration.sql` contains four `ALTER TABLE "Bot" ADD COLUMN` statements: `voiceEnabled BOOLEAN NOT NULL DEFAULT false`, `stt "Provider"`, `tts "Provider"`, `voiceId TEXT` — additive only, no row/column rewrites.
- `prisma validate`, `prisma generate`, and `typecheck` all pass.

## Non-Functional Requirements

- Migration byte-matches Prisma's `AddColumn` SQL format.
- No secrets/PII. Prettier/ESLint clean. Comment edited for accuracy only.

## Files in Scope

- Modify: `apps/server/prisma/schema/bot.prisma` (add 4 fields to `Bot` + update header comment)
- Create: `apps/server/prisma/migrations/20260618142629_add_bot_voice_config/migration.sql`
- Create: `docs/18-06-2026-14-26-29-db-bot-voice-config.md` (this plan)

## Risks & Assumptions

- Assumption (confirmed): `stt`/`tts` use the `Provider?` enum; scope is exactly the four fields; generate-only this session.
- Assumption: `voiceEnabled` default `false` is the mechanism that keeps existing bots text-only (per acceptance criteria).
- Note (not a blocker): no exhaustive `switch` over `Bot` voice fields exists yet, so adding nullable columns is non-breaking at the TS layer.
- New migration timestamp `20260618142629` generated at execution time (later than `20260618141058`).

## Open Questions / Blockers

- None — all resolved during brainstorming.

## Status

- [x] Ready to execute
- [ ] Blocked

## Task List

| #   | Status | Task                                                                                                                                                                                                | Responsible Role | Dependencies | Skills       |
| --- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------- | ------------ | ------------ |
| 1   | TODO   | Add `voiceEnabled Boolean @default(false)`, `stt Provider?`, `tts Provider?`, `voiceId String?` to the `Bot` model in `bot.prisma`, and update the header comment to mention optional voice config. | developer        | none         | `clean-code` |
| 2   | TODO   | Hand-author `migration.sql` in a new `20260618142629_add_bot_voice_config/` dir with 4 `ALTER TABLE "Bot" ADD COLUMN` statements. Generate-only.                                                    | developer        | task 1       | `clean-code` |
| 3   | TODO   | Run `pnpm prisma:generate`, `pnpm exec prisma validate`, `pnpm typecheck` in `apps/server`; confirm all pass and report verbatim output.                                                            | developer        | task 1, 2    | `clean-code` |
