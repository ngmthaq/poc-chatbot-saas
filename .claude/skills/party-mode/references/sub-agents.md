# Sub-Agents

Central skill index for all **ephemeral sub-agents** spawned by the Root Agent during workflow execution. Each role is defined as a reference below.

> Sub-agents are **skill-bound**: the Root Agent passes the matching role reference inline when spawning.

---

## Roles

| Role      | Reference                   | Mode                | Edits      |
| --------- | --------------------------- | ------------------- | ---------- |
| Planner   | [planner](./planner.md)     | plan-mode           | none       |
| Debugger  | [debugger](./debugger.md)   | plan-mode           | none       |
| Developer | [developer](./developer.md) | acceptEdits         | production |
| Tester    | [tester](./tester.md)       | acceptEdits         | test files |
| Reviewer  | [reviewer](./reviewer.md)   | default (read-only) | none       |

---

## Common Rules

All sub-agents, regardless of role, must:

- **Never delegate.** Only the Root Agent spawns or re-spawns sub-agents.
- **Never exceed assigned scope.** Surface scope creep as a blocker — do not silently expand.
- **Return structured output.** Always use the response template matching the role — see [agent-response-template](./agent-response-template.md).
- **No silent failures.** Any blocked task, failed check, or missing input must be reported explicitly.
- **Ask when unclear.** If the delegation is missing required sections, refuse and list what is missing.
