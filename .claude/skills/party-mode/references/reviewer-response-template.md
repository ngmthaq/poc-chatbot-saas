# Reviewer Response Template

## Template

```md
- From: reviewer (sub-agent loaded with the [reviewer skill](./reviewer.md))
- To: Root Agent
- Title: Review Response — {short title matching the review request title}
- Description: {one sentence stating the decision and the primary reason}

---

## Decision

- [ ] accepted — output meets all requirements and quality standards
- [ ] blocked — issues must be resolved before acceptance

## Summary

{2–4 sentences explaining the overall quality of the output and the basis for the decision.}

## Checklist Results

| Item                                                | Result                | Notes   |
| --------------------------------------------------- | --------------------- | ------- |
| Satisfies original user requirement                 | pass - fail - partial | {notes} |
| Follows project conventions and skill references    | pass - fail - partial | {notes} |
| No unintended side effects or regressions           | pass - fail - partial | {notes} |
| Tests cover required scenarios and pass             | pass - fail - partial | {notes} |
| No security, performance, or maintainability issues | pass - fail - partial | {notes} |

## Issues Found (if blocked)

{List each issue clearly. Each issue must include enough detail for the responsible sub-agent to act on it without further clarification, and a `Responsible Role` flag so the Root Agent can route the re-spawn. Flagging is not delegation — only the Root Agent re-spawns.}

| #   | Severity                       | File           | Responsible Role   | Description                      |
| --- | ------------------------------ | -------------- | ------------------ | -------------------------------- |
| 1   | critical - high - medium - low | {path/to/file} | developer - tester | {clear description of the issue} |
| …   | …                              | …              | …                  | …                                |

- Leave empty if decision is `accepted`.

> **Note:** Create a detailed description for each issue, so that the Root Agent can route it to the flagged sub-agent with clear instructions for resolution. Avoid vague feedback like "Code quality is poor" — instead, specify "Function `calculateTotal` in `billing.js` has a cyclomatic complexity of 15, which exceeds our standard of 10."

## Recommendations (non-blocking)

{Optional: suggestions for improvement that are not blockers but worth noting for future iterations.}

- Leave empty if none.
```

---

## Usage Notes

- Decision must be binary: `accepted` or `blocked`. No partial acceptance.
- Every issue in the Issues table must flag a `Responsible Role` (developer or tester) — the Root Agent uses this hint to route the re-spawn. Flagging is not delegation; only the Root Agent re-spawns.
- `critical` or `high` severity issues always result in `blocked`. `medium` or `low` may be accepted at reviewer discretion.
- Reviewer must not silently pass work that partially meets requirements — use `partial` in checklist and block if needed.
