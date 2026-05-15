# Step 6 — Completeness Check (Root Agent)

| Condition                                        | Action                                                 |
| ------------------------------------------------ | ------------------------------------------------------ |
| Status is incomplete or requirements are unclear | Loop back to **Step 2** (re-plan with updated context) |
| Status is complete                               | Proceed to **Step 7** (review)                         |

When the Root Agent receives a complete response, it must:

- **NOT** modify code directly
- Proceed to **Step 7**

When looping back, the Root Agent must pass:

- The original prompt
- The previous plan
- The failure reason or missing requirement from the sub-agent result
