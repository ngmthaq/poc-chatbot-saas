# Step 4 — Delegation to Sub-Agents

The Root Agent reads the plan and spawns the appropriate sub-agent(s).

> **ALWAYS** spawn a sub-agent; **DO NOT** modify code directly.

## Spawn the developer sub-agent

Use the developer delegation prompt template; pass the developer skill inline.

> Prompt template skill: [delegation-prompt](./delegation-prompt.md) — `Developer Delegation Prompt`
> Role skill: [developer](./developer.md)

## Spawn the tester sub-agent

Use the tester delegation prompt template; pass the tester skill inline.

> Prompt template skill: [delegation-prompt](./delegation-prompt.md) — `Tester Delegation Prompt`
> Role skill: [tester](./tester.md)

## Running in parallel

When developer and tester scopes do not overlap (or when the project's `Testing Workflow` is `Test-First`), the Root Agent **must** spawn both sub-agents in the **same tool turn** (multiple tool calls in one message) so they execute concurrently. Otherwise spawn them sequentially: developer first, then tester.
