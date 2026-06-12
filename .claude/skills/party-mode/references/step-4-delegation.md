# Step 4 — Delegation to Sub-Agents

The Root Agent reads the approved plan and spawns the appropriate sub-agent(s) — **developer** and **tester** are the only sub-agent roles (each loaded with the matching role reference from [sub-agents](./sub-agents.md)).

> **ALWAYS** spawn a sub-agent; **DO NOT** modify code directly.

## Spawn the developer sub-agent

Use when delegating implementation tasks from an approved plan; pass the developer skill inline.

> Prompt template skill: [developer-delegation-prompt](./developer-delegation-prompt.md)
> Role skill: [developer](./developer.md)

## Spawn the tester sub-agent

Use when delegating test-writing tasks from an approved plan; pass the tester skill inline.

> Prompt template skill: [tester-delegation-prompt](./tester-delegation-prompt.md)
> Role skill: [tester](./tester.md)

## Running in parallel

When developer and tester scopes do not overlap (or when the project's `Testing Workflow` is `Test-First`), the Root Agent **must** spawn both sub-agents in the **same tool turn** (multiple tool calls in one message) so they execute concurrently. Otherwise spawn them sequentially: developer first, then tester.

## Re-delegation

When the Root Agent's review (Step 6) finds the output not fully qualified, re-spawn the sub-agent flagged in each issue's `Responsible Role` with the review feedback pasted into the delegation's `Review Feedback` section.
