# Step 3.5 — User Approval Gate

Before any implementation begins, the Root Agent **must** present the full plan response to the user and **wait** for explicit approval. **DO NOT** make things up.

## Approved

When the user approves, persist the plan to the **Doc Directory** as a markdown file. Always copy the planner/debugger response verbatim — **DO NOT** make things up.

- File name template: `<dd-mm-yyyy-hh-mm-ss>-<plan-name>.md`
- Example: `01-12-2026-16-30-01-handle-send-registration-mail.md`

Then proceed to **Step 4**.

## Requests Changes

Return to **Step 2** with the user's change request. **DO NOT** spawn implementation sub-agents until the user has explicitly approved a plan. This gate applies on every planning cycle, including re-plans triggered by incomplete results.

## Cancels / Aborts

Stop the workflow and acknowledge.
