# Step 5 — Sub-Agent Result Return

Developer and tester sub-agents return results using the **sub-agent result template** below.

A sub-agent that cannot proceed without clarification does not guess — it returns the result with its `Open Questions` section populated. The Root Agent answers from the approved plan and brainstorming context, or asks the user when the answer is not on record, then re-delegates with the answers included.

---

## Sub-Agent Result Template

```md
- From: developer | tester (sub-agent loaded with the matching role skill)
- To: Root Agent
- Title: Result — {short title matching the original delegation title}
- Description: {one sentence summarising what was completed or why it is incomplete}

---

## Status

- [ ] complete
- [ ] incomplete — reason: {brief reason}

## Work Summary

{2–4 sentences describing what was done. Be specific — reference function names, file paths, test names.}

## Files Changed

| File           | Action                       | Notes                        |
| -------------- | ---------------------------- | ---------------------------- |
| {path/to/file} | created - modified - deleted | {brief note on what changed} |
| …              | …                            | …                            |

## Tasks Completed

| #   | Task               | Outcome                  |
| --- | ------------------ | ------------------------ |
| 1   | {task description} | done - skipped - blocked |
| …   | …                  | …                        |

## Test Results (tester sub-agent only)

| Test        | Type                     | Result                |
| ----------- | ------------------------ | --------------------- |
| {test name} | unit - integration - e2e | pass - fail - skipped |
| …           | …                        | …                     |

## Open Questions

{List every question that must be answered by the Root Agent (or the user) before the affected tasks can proceed. Be direct and specific — name the task, the decision needed, and the options if any. Never guess instead of asking.}

- Leave empty if none.

## Blockers / Missing Requirements

{List anything that prevented full completion. Be precise — vague blockers cause unnecessary re-planning loops.}

- Leave empty if status is complete.

## Notes for Root Agent

{Optional: any observations, risks, or follow-up recommendations the root agent should know about.}
```

---

## Usage Notes

- Status must be set explicitly — `complete` or `incomplete`. No ambiguous states.
- If `incomplete`, the `Blockers` section is mandatory. Root Agent uses this to build the re-delegation or re-planning context.
- If any `Open Questions` are listed, Status must be `incomplete` — the Root Agent answers them (asking the user when needed) and re-delegates with the answers included.
- `Files Changed` table must be complete and accurate — the Root Agent's review (Step 6) relies on it.
- Do not mark `complete` if any assigned task was skipped without explicit justification.
