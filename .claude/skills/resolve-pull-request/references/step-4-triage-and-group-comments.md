# Step 4 — Triage and Group Comments

Turn the raw comments from Step 3 into a clean list of **actionable tasks**. This list becomes the requirement handed to party-mode in Step 5.

## Filter out non-actionable comments

Skip a comment (and record the reason for the Step 7 report) when it is:

- **Already resolved** or **outdated** (anchored to a line that no longer exists).
- **Pure praise or acknowledgement** ("nice", "LGTM", "thanks").
- **A question with no requested change** — instead, draft a reply for Step 6 rather than a code change.
- **Out of scope** for this PR (e.g. "we should refactor the whole module someday").
- **Vague / not actionable** — cannot be tied to a concrete change. Note it for the user instead of guessing.

Never invent the reviewer's intent. If a comment is ambiguous but clearly expects a change, carry it forward as an **open question** for party-mode's brainstorming step rather than guessing the fix.

## Classify each actionable comment

Tag each as `bug` (something incorrect/broken the reviewer flagged) or `feature` (a requested improvement, refactor, naming, or behaviour change). This classification feeds party-mode's intent classification.

## Group related comments

Cluster comments that touch the same file, function, or concern into a single task so one delegation can address them together. Keep the originating comment IDs attached to each task — Step 6 needs them to reply and resolve.

## Produce the triage table

```markdown
| #   | File        | Line | Author    | Request (summary)                        | Class   | Action      | Comment IDs |
| --- | ----------- | ---- | --------- | ---------------------------------------- | ------- | ----------- | ----------- |
| 1   | `user.ts`   | 42   | @reviewer | Extract validation into its own function | feature | resolve     | 1234        |
| 2   | `user.ts`   | 88   | @reviewer | Use parameterized query (SQL injection)  | bug     | resolve     | 1235        |
| 3   | `README.md` | 10   | @reviewer | "nice catch"                             | —       | skip-praise | 1236        |
| 4   | `api.ts`    | 5    | @reviewer | "could we cache this?" (question)        | —       | reply-only  | 1237        |
```

Present this table to the user before proceeding, so they can confirm the triage. The `resolve` rows are the work; `reply-only` rows get a reply in Step 6; `skip-*` rows are reported in Step 7.
