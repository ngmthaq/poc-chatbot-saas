# Plan Response Template

## Template

```md
- From: planner | debugger (sub-agent loaded with the matching role skill)
- To: Root Agent
- Title: Plan Response — {short title matching the original request title}
- Description: {one sentence summarising the proposed approach}

---

## Approach Summary

- {2–4 sentences explaining the overall implementation or fix strategy. Why this approach was chosen.}

## Functional Requirements

- {List the specific functional requirements that must be met for this plan to be considered successful. Each requirement should be testable and verifiable.}

## Non-Functional Requirements

- {List any performance, security, maintainability, or other non-functional requirements relevant to this plan.}

## Files in Scope

- {List all files expected to be created, modified, or deleted}

## Risks & Assumptions

- {List any assumptions made during planning}
- {List any risks the root agent should be aware of}

## Open Questions / Blockers

> **Rule: ALWAYS surface unclear items to the Root Agent. Never assume.**
> If any task, requirement, or design decision cannot be resolved during planning, list it explicitly. The Root Agent will ask the user before execution begins.

- {List unresolved questions that require user clarification before execution}
- {List any blockers that prevent a specific task from being planned accurately}
- Leave empty if none.

## Status

- [ ] Ready to execute
- [ ] Blocked — requires user input on: {describe each blocker clearly}

## Task List

{Ordered list of atomic tasks. Each task must map to a specific sub-agent.}

| #   | Status | Task               | Responsible Role | Dependencies | Skills             |
| --- | ------ | ------------------ | ---------------- | ------------ | ------------------ |
| 1   | WIP    | {task description} | developer        | none         | `clean-code`       |
| 2   | TODO   | {task description} | tester           | task 1       | `testing-workflow` |
| …   | …      | …                  | …                | …            | …                  |

> **Note:** Tasks must be atomic and actionable. Avoid vague descriptions like "Refactor codebase" — instead, break it down into specific changes to files or functions. Each task must flag a `Responsible Role` (developer or tester) so the Root Agent can route correctly, and reference any relevant skills that should be applied during execution.

> **Note:** Status field in `Task List` includes:

- `TODO` for tasks not yet started
- `WIP` for tasks currently in progress
- `BLOCKED` for tasks that cannot proceed due to an unresolved issue (with a reference to the blocker in the Blockers section)
- `SKIPPED` for tasks intentionally left out of this iteration (with justification in the Notes for Root Agent section)
- `DONE` for completed tasks
```

---

## Usage Notes

- Every task in the Task List must flag a `Responsible Role` (developer or tester). Flagging is a routing hint for the Root Agent — the planner/debugger does not delegate.
- **ALWAYS set Status to `Blocked` and list every open question** when anything is unclear — do not plan around gaps or make assumptions.
- If Status is `Blocked`, the Root Agent must ask the user before proceeding to Step 4. Execution must not begin with unresolved blockers.
- Root Agent uses this response to populate delegation prompts for the [developer](./developer.md) and [tester](./tester.md) sub-agents.
