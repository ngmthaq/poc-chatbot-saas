# Feature Planning Prompt

## Template

```md
- From: Root Agent
- To: planner (sub-agent loaded with [planner skill](./planner.md))
- Title: Feature Planning Request — {short title of the feature}
- Description: {one sentence describing what this feature/refactor achieves}

---

## Document References

- {list any relevant documents from memory or the plan that the planner should reference}

## Skill References

- {list all relevant skill files scanned from the skills/ directory that planner should apply}

## Original User Prompt

{paste the full original user prompt verbatim}

## Constraints

**ALWAYS ask the user when any section cannot be filled with confidence** — do not infer, guess, or proceed with placeholders. If any requirement, constraint, or context field cannot be filled with certainty from the user prompt, list it here and STOP. Do not process until the user has answered every open question.

## Additional Information

{Root Agent can add additional information here to help planner create the plan}
```

---

## Usage Notes

- The Root Agent doesn't need to explore the codebase if the task is too complex; let the planer sub-agent handle that.
- Always load documents from the **Documents Folder** before delegating tasks to sub-agents; this will help extract additional information from previous tasks if relevant.
- `Document References` should include any relevant memory items or previous plans that the planner should reference when creating the implementation plan.
- `Skill References` must be populated by scanning the `skills/` directory and selecting all files relevant to the feature domain.
- Planner must respond using [agent-response-template](./agent-response-template.md) skill (`Plan Response Template` section).
