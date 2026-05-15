## Purpose

Shared response template skill used by sub-agents when sending structured output back to the **Root Agent**.

Use the section that matches the response type:

- `Plan Response Template` for the [planner](./planner.md) and [debugger](./debugger.md) roles
- `Sub-Agent Result Template` for the [developer](./developer.md) and [tester](./tester.md) roles
- `Reviewer Response Template` for the [reviewer](./reviewer.md) role

---

## Plan Response Template

Use when a sub-agent loaded with the [planner](./planner.md) or [debugger](./debugger.md) role is returning a structured implementation or fix plan.
Load the template from this reference: [plan-response-template](./plan-response-template.md).

---

## Sub-Agent Result Template

Use when a sub-agent loaded with the [developer](./developer.md) or [tester](./tester.md) role is returning work results after execution.
Load the template from this reference: [sub-agent-result-template](./sub-agent-result-template.md).

---

## Reviewer Response Template

Use when a sub-agent loaded with the [reviewer](./reviewer.md) role is returning a final review decision.
Load the template from this reference: [reviewer-response-template](./reviewer-response-template.md).
