# Bug Planning Prompt

## Template

```md
- From: Root Agent
- To: debugger (sub-agent loaded with [debugger skill](./debugger.md))
- Title: Bug Fix Planning Request — {short title of the bug}
- Description: {one sentence describing the broken behavior and its impact}

---

## Document References

- {list any relevant documents from memory or the plan that the debugger should reference}

## Skill References

- {list all relevant skill files scanned from the skills/ directory that debugger should apply}

## Original User Prompt

{paste the full original user prompt verbatim}

## Constraints

**ALWAYS ask the user when any section cannot be filled with confidence** — do not infer, guess, or proceed with placeholders. If any requirement, constraint, or context field cannot be filled with certainty from the user prompt, list it here and STOP. Do not process until the user has answered every open question.

## Additional Information

### Observed Behavior

{Describe exactly what is happening. Include error messages, stack traces, or logs if available.}

### Expected Behavior

{Describe what should happen instead.}

### Reproduction Steps

1. {Step one}
2. {Step two}
3. {Add more as needed}

{Root Agent can add additional information here to help debugger create the fix plan}
```

---

## Usage Notes

- The Root Agent doesn't need to explore the codebase if the task is too complex; let the debugger sub-agent handle that.
- Always load documents from the **Documents Folder** before delegating tasks to sub-agents; this will help extract additional information from previous tasks if relevant.
- `Document References` should include any relevant memory items or previous plans that the debugger should reference when creating the fix plan.
- `Skill References` must be populated by scanning the `skills/` directory and selecting all files relevant to the bug domain.
- Debugger must respond using [agent-response-template](./agent-response-template.md) skill (`Plan Response Template` section).
- User prompts can be confusing or contain spelling errors; Root Agent must analyze and clarify them, then provide the following information to the debugger:
  - Observed Behavior (Describe exactly what is happening)
  - Expected Behavior (Describe what should happen instead)
  - Reproduction Steps
