# Step 3 — User Approval Gate

Before any implementation begins, the Root Agent **MUST** present the full plan (plan template from [Step 2 — Planning](./step-2-planning.md)) to the user and **wait** for explicit approval. **DO NOT** make things up.

## Approved

When the user approves, persist the plan to the **Doc Directory** as a markdown file. Always copy the plan verbatim — **DO NOT** make things up.

- File name template: `<dd-mm-yyyy-hh-mm-ss>-<plan-name>.md`
- Example: `01-12-2026-16-30-01-handle-send-registration-mail.md`

Then proceed to **Step 4**.

## Requests Changes

Return to **Step 1 (Brainstorming)** with the user's change request, re-clarify, and produce a revised plan. **DO NOT** spawn implementation sub-agents until the user has explicitly approved a plan. This gate applies on every planning cycle, including re-plans triggered by incomplete results.

## Cancels / Aborts

Stop the workflow and acknowledge.
