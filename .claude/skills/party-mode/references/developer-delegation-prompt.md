# Developer Delegation Prompt

## Template

```md
- From: Root Agent
- To: developer (sub-agent loaded with [developer skill](./developer.md))
- Title: Implementation Task — {short title matching the plan title}
- Description: {one sentence describing what must be implemented in this delegation}

---

## Document References

- {list any relevant documents from memory or the approved plan that the developer should reference}

## Skill References

- {list all relevant skill files scanned from the skills/ directory that developer should apply}

## Tasks Assigned

{Extract only the developer tasks from the approved plan's Task List. Do not include tester tasks.}

| #   | Task               | Dependencies     | Acceptance Criteria    |
| --- | ------------------ | ---------------- | ---------------------- |
| 1   | {task description} | {none or task #} | {what done looks like} |
| …   | …                  | …                | …                      |

## Files in Scope

- Create: {list files to create}
- Modify: {list files to modify}
- Delete: {list files to delete, if any}

## Architecture & Conventions

- {Patterns to follow: naming conventions, folder structure, design patterns}
- {Frameworks, libraries, or internal utilities to use}
- {Anything explicitly NOT allowed}

## Constraints

- {Performance, security, backward-compatibility, or scope constraints}
- {Must not break: list critical existing behaviors}

## Test Cases (if **Testing Workflow** is `Test-First`)

- {list all files created or modified by the tester sub-agent}

## Review Feedback (if re-delegation)

{If this is a re-delegation triggered by the Root Agent's review (Step 6), paste the relevant review feedback rows here. Leave empty on first delegation.}

## Answered Questions (if re-delegation)

{If the previous result returned Open Questions, paste each question with the Root Agent's (or user's) answer here. Leave empty on first delegation.}

## Expected Output

Return your result using the `Sub-Agent Result Template` from [Step 5 — Sub-Agent Result Return](./step-5-result-return.md).

## Additional Information

{Root Agent can add additional information here to help developer implement task}
```

---

## Usage Notes

- Root Agent must scan `skills/` and assign all relevant skill files to `Skill References` before delegating.
- `Document References` should include any relevant memory items or the approved plan that the developer should reference when implementing.
- On re-delegation after a failed review, always include the `Review Feedback` section — developer must address each point explicitly.
- On re-delegation after open questions, always include the `Answered Questions` section so the developer can proceed without guessing.
- `Acceptance Criteria` per task is mandatory — vague tasks produce vague results.
- Developer must respond using the `Sub-Agent Result Template` from [Step 5 — Sub-Agent Result Return](./step-5-result-return.md).
