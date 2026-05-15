# Step 7 — Review

Spawn a sub-agent that loads the **reviewer** skill, using the reviewer delegation prompt template.

> Prompt template skill: [delegation-prompt](./delegation-prompt.md) — `Reviewer Delegation Prompt`
> Role skill: [reviewer](./reviewer.md)

| Reviewer Decision            | Root Agent Action       |
| ---------------------------- | ----------------------- |
| `blocked` — issues found     | Loop back to **Step 4** |
| `accepted` — output is valid | Proceed to **Step 8**   |
