## Purpose

Shared delegation prompt skill used by the **Root Agent** when spawning planning, implementation, testing, and review sub-agents (each loaded with the matching role reference from [sub-agents](./sub-agents.md)).

Use the section that matches the target role and request type:

- `Feature Planning Prompt` for the [planner](./planner.md) role on `feature` or `refactor`
- `Bug Planning Prompt` for the [debugger](./debugger.md) role on `bug`
- `Developer Delegation Prompt` for the [developer](./developer.md) role
- `Tester Delegation Prompt` for the [tester](./tester.md) role
- `Reviewer Delegation Prompt` for the [reviewer](./reviewer.md) role

---

## Feature Planning Prompt

Use when spawning a sub-agent loaded with the [planner](./planner.md) role to plan a feature or refactor.
Load the references from [feature-planning-prompt](./feature-planning-prompt.md) for the full template and usage notes.

---

## Bug Planning Prompt

Use when spawning a sub-agent loaded with the [debugger](./debugger.md) role to plan a fix.
Load the references from [bug-planning-prompt](./bug-planning-prompt.md) for the full template and usage notes.

---

## Developer Delegation Prompt

Use when spawning a sub-agent loaded with the [developer](./developer.md) role to implement tasks from an approved plan.
Load the references from [developer-delegation-prompt](./developer-delegation-prompt.md) for the full template and usage notes.

---

## Tester Delegation Prompt

Use when spawning a sub-agent loaded with the [tester](./tester.md) role to write and run tests.
Load the references from [tester-delegation-prompt](./tester-delegation-prompt.md) for the full template and usage notes.

---

## Reviewer Delegation Prompt

Use when spawning a sub-agent loaded with the [reviewer](./reviewer.md) role to review completed developer and tester output.
Load the references from [reviewer-delegation-prompt](./reviewer-delegation-prompt.md) for the full template and usage notes.
