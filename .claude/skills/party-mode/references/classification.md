## Purpose

Used by the **Root Agent** to classify every incoming user prompt before any execution occurs. Classification determines how the work is routed through the planning pipeline.

---

## Classification Rules

### Feature

Classify as `feature` when the prompt describes:

- New functionality to be added
- Agent skill additions or modifications that add new capabilities
- An existing behaviour to be refactored or improved
- A performance improvement with no broken behaviour involved
- A non-breaking change that adds value or enhances the user experience
- A change that is explicitly framed as a "feature" by the user

**Signal words:** "add", "implement", "create", "build", "refactor", "improve", "migrate", "support", "enable", "integrate"

### Bug

Classify as `bug` when the prompt describes:

- Something that was working and is now broken
- Unexpected or incorrect behaviour
- A crash, error, or exception
- A regression introduced by a recent change
- Output that does not match the specification
- A change that is explicitly framed as a "bug" by the user

**Signal words:** "broken", "not working", "fails", "error", "crash", "wrong", "incorrect", "regression", "unexpected", "should be", "used to work"

---

## Ambiguous Cases

**Rule: ALWAYS ask the user. Never assume.**

If the prompt contains signals for more than one of `feature` or `bug`, or if any field cannot be filled with confidence. Stop and ask the user a direct, specific question before proceeding. Do not guess, infer, or proceed with a best-effort classification. Only proceed to delegation once every ambiguity is resolved by the user.

---

## Usage Notes

- Classification is always the **first action** of the Root Agent. No execution or delegation happens before it.
- **ALWAYS ask the user when anything is unclear** — intent, scope, affected area, expected behaviour. There are no acceptable assumptions.
- For `feature`, spawn a sub-agent loaded with the [planner](./planner.md) role using [delegation-prompt](./delegation-prompt.md) (Feature Planning Prompt section)
- For `bug`, spawn a sub-agent loaded with the [debugger](./debugger.md) role using [delegation-prompt](./delegation-prompt.md) (Bug Planning Prompt section)
- A prompt that cannot be classified without guessing must be treated as blocked until the user clarifies.
