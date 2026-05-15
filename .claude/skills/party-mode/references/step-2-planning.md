# Step 2 — Planning

## If `feature` or `refactor`

Spawn a sub-agent that loads the **planner** skill, in plan-mode, using the feature planning prompt template.

> Prompt template skill: [delegation-prompt](./delegation-prompt.md) — `Feature Planning Prompt`
> Role skill (passed to sub-agent): [planner](./planner.md)

## If `bug`

Spawn a sub-agent that loads the **debugger** skill, in plan-mode, using the bug planning prompt template.

> Prompt template skill: [delegation-prompt](./delegation-prompt.md) — `Bug Planning Prompt`
> Role skill (passed to sub-agent): [debugger](./debugger.md)
