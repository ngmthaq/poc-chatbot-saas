# Tester Delegation Prompt

## Template

```md
- From: Root Agent
- To: tester (sub-agent loaded with [tester skill](./tester.md))
- Title: Testing Task — {short title matching the plan title}
- Description: {one sentence describing what must be tested in this delegation}

---

## Document References

- {list any relevant documents from memory or the approved plan that the tester should reference}

## Skill References

- {list all relevant skill files scanned from the skills/ directory that tester should apply}

## Implementation Summary

{Brief description of what the developer implemented — what changed and why, so tester understands scope.}

## Files Changed by Developer (if **Testing Workflow** is `Code-First`)

- {list all files created or modified by the developer sub-agent}

## Tasks Assigned

{Extract only the tester tasks from the approved plan's Task List.}

| #   | Task           | Test Type                | Acceptance Criteria       |
| --- | -------------- | ------------------------ | ------------------------- |
| 1   | {what to test} | unit - integration - e2e | {what passing looks like} |
| …   | …              | …                        | …                         |

## Test Scenarios Required

- Happy path: {describe the expected successful flow}
- Edge cases: {list edge cases to cover}
- Failure cases: {list failure / error scenarios to validate}

## Constraints

- {Test framework or tooling to use}
- {Coverage threshold if applicable}
- {Must not modify production code}

## Review Feedback (if re-delegation)

{If this is a re-delegation triggered by the Root Agent's review (Step 6), paste the test-related review feedback rows here. Leave empty on first delegation.}

## Answered Questions (if re-delegation)

{If the previous result returned Open Questions, paste each question with the Root Agent's (or user's) answer here. Leave empty on first delegation.}

## Expected Output

Return your result using the `Sub-Agent Result Template` from [Step 5 — Sub-Agent Result Return](./step-5-result-return.md).

## Additional Information

{Root Agent can add additional information here to help tester implement task}
```

---

## Usage Notes

- Root Agent must scan `skills/` and assign all relevant skill files to `Skill References` before delegating.
- `Document References` should include any relevant memory items or the approved plan that the tester should reference when creating tests.
- Tester must not modify production code — only test files.
- Tester must not review or judge the developer's work. If a test fails because of the developer's code, just record `fail` in `Test Results` — the Root Agent decides at review (Step 6) whether developer or tester output is correct.
- On re-delegation after a failed review, always include the `Review Feedback` section — tester must address each point explicitly.
- Tester must respond using the `Sub-Agent Result Template` from [Step 5 — Sub-Agent Result Return](./step-5-result-return.md).
