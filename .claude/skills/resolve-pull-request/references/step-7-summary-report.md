# Step 7 — Summary Report

After threads are replied to and resolved, report back to the user.

The report must include:

- **Resolved** — each reviewer comment that was addressed: the file + line, a one-line description of the fix, and the commit(s) involved.
- **Replied (no code change)** — questions or notes answered without a code change.
- **Skipped** — comments not acted on, each with the reason (already resolved, outdated, praise, out of scope, vague/ambiguous).
- **Outstanding** — any comment whose fix was `incomplete` / `blocked` in party-mode, or any thread left open and why. Surface these clearly; do not pave over them.
- **PR state** — the branch pushed, the PR/MR URL, and counts (resolved / replied / skipped / outstanding).

## Suggested format

```markdown
## Resolve Summary — PR #<number>

**Resolved (N):**
| File | Line | Fix | Comment ID |
| ---- | ---- | --- | ---------- |
| `user.ts` | 88 | Switched to parameterized query | 1235 |

**Replied, no code change (N):**
| File | Line | Reply | Comment ID |
| ---- | ---- | ----- | ---------- |

**Skipped (N):**
| File | Line | Reason | Comment ID |
| ---- | ---- | ------ | ---------- |

**Outstanding (N):**
| File | Line | Status | Notes | Comment ID |
| ---- | ---- | ------ | ----- | ---------- |
```

If a party-mode plan document was produced, update its `Status` column to reflect the resolved/outstanding state of each task.
