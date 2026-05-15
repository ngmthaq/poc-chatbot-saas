# Reviewer Delegation Prompt

## Template

```md
- From: Root Agent
- To: reviewer (sub-agent loaded with [reviewer skill](./reviewer.md))
- Title: Review Request — {short title matching the original task title}
- Description: {one sentence describing what was built or fixed and what the reviewer must assess}

---

## Document References

- {list any relevant documents from memory or the original plan that the reviewer should reference}

## Skill References

- {list all relevant skill files scanned from the skills/ directory that reviewer should apply}

## Original User Requirement

{Paste the original user prompt verbatim. Reviewer must validate against this, not assumptions.}

## Work Completed

### Developer Output

{Summary of what the developer sub-agent implemented — reference files and key changes.}

### Tester Output

{Summary of what the tester sub-agent produced — reference test files and results.}

## Files Changed

| File           | Action                       | Changed By         |
| -------------- | ---------------------------- | ------------------ |
| {path/to/file} | created - modified - deleted | developer - tester |
| …              | …                            | …                  |

## Previous Review Feedback (if re-review)

{If this is a second review after a block, summarise what was blocked and what was done to address it. Leave empty on first review.}

## Review Checklist

Reviewer must assess all of the following:

- [ ] Output satisfies the original user requirement
- [ ] Code follows project conventions and skill references
- [ ] No unintended side effects or regressions
- [ ] Tests cover the required scenarios and pass
- [ ] No obvious security, performance, or maintainability issues

## Expected Output

Return your result using [agent-response-template](./agent-response-template.md) skill (`Reviewer Response Template` section).

## Additional Information

{Root Agent can add additional information here to help reviewer review the output}
```

---

## Usage Notes

- Root Agent must scan `skills/` and assign all relevant skill files to `Skill References` — reviewer enforces them.
- `Document References` should include any relevant memory items or the original plan that the reviewer should reference when assessing.
- On re-review, always include the `Previous Review Feedback` section so reviewer can confirm issues were resolved.
- Reviewer must not modify code — only assess and report.
- Reviewer must respond using [agent-response-template](./agent-response-template.md) skill (`Reviewer Response Template` section).
