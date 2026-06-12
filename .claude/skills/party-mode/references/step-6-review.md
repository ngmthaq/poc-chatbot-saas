# Step 6 — Review (Root Agent)

The Root Agent reviews the developer and tester output itself — no reviewer sub-agent is spawned. The review validates the delivered work against the **approved plan**, project **conventions**, **security**, and **business logic**. It is the last gate before the user receives the result.

> Review is read-only. No file edits, no test authoring, no command execution beyond read-only inspection and required skill checks.

---

## Routing

| Sub-agent result                            | Root Agent action                                                                                         |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------- |
| `Open Questions` present                    | Answer from the plan/brainstorming context — or ask the user — then re-delegate (**Step 4**) with answers |
| `incomplete` or `blocked`                   | Resolve the blocker (re-plan via **Step 1/2** if the plan is wrong), then re-delegate (**Step 4**)        |
| `complete` — review **not fully qualified** | Loop back to **Step 4**: re-spawn the sub-agent flagged in each issue's `Responsible Role` with feedback  |
| `complete` — review **accepted**            | Proceed to **Step 7** (summary report)                                                                    |

---

## Review Workflow

1. **Check the self-reported `Status` first.** If any sub-agent result is `incomplete` or `blocked`, or contains `Open Questions`, resolve those before reviewing quality — see the routing table above.
2. **Validate against the approved plan and the original user requirement.** Read the original user prompt verbatim and the approved plan. The work must satisfy both — a delegation summary can drift from the user's intent.
3. **Inspect every file in the `Files Changed` tables.** Do not rely on the sub-agent summaries alone — read the actual code and tests.
4. **Check project conventions.** Naming, folder structure, patterns, frameworks, and every skill assigned in the delegation must be followed.
5. **Check security.** Run the executable skill checks on the diff — a failing check is automatically a fail.
6. **Check business logic.** Walk the changed code paths against the plan's functional requirements: correct behaviour, edge cases handled, no unintended side effects or regressions.
7. **Check tests.** Tests cover the required scenarios (happy path, edge cases, failure cases), pass, and — for bug fixes — include the mandatory regression test.
8. **On re-review, verify each prior issue was resolved.** Walk the previous review's issue list and confirm a concrete change addresses each one. Issues still present remain failed.
9. **Decide.** `accepted` only if every checklist item passes and no critical or high-severity issue remains. Otherwise loop back to Step 4 with review feedback.

---

## Checklist

| Item                                                 | Result                |
| ---------------------------------------------------- | --------------------- |
| Satisfies the approved plan and original requirement | pass - fail - partial |
| Follows project conventions and skill references     | pass - fail - partial |
| No unintended side effects or regressions            | pass - fail - partial |
| Tests cover required scenarios and pass              | pass - fail - partial |
| No security, performance, or maintainability issues  | pass - fail - partial |

- The decision is **binary**: `accepted` or `not qualified` — never "accepted with issues".
- `critical` or `high` severity issues always fail the review. `medium` or `low` may be accepted at the Root Agent's discretion but must be noted in the summary report as recommendations.
- Anything `partial` must either be resolved before acceptance or fail the review. No silent passes.

---

## Review Feedback (when not qualified)

For each issue, record enough detail for the responsible sub-agent to act on it without further clarification, and a `Responsible Role` so the re-spawn routes correctly:

| #   | Severity                       | File           | Responsible Role   | Description                      |
| --- | ------------------------------ | -------------- | ------------------ | -------------------------------- |
| 1   | critical - high - medium - low | {path/to/file} | developer - tester | {clear description of the issue} |
| …   | …                              | …              | …                  | …                                |

> **Note:** Avoid vague feedback like "Code quality is poor" — instead, specify "Function `calculateTotal` in `billing.js` has a cyclomatic complexity of 15, which exceeds our standard of 10." Paste the relevant rows into the `Review Feedback` section of the re-delegation prompt.

---

## Rules

- **No silent failures.** Any `incomplete`, `blocked`, or open question must be surfaced and resolved — not paved over.
- The Root Agent never fixes issues itself — every fix is re-delegated to the responsible sub-agent.
- Track the loop guard: after **2 consecutive failed reviews** on the same output, surface the findings to the user and ask whether to proceed or abort.

---

## Minimum Skill References

Apply, at minimum, on every review:

- [clean-code](../../clean-code/SKILL.md) — code review checklist
- [testing-workflow](./testing-workflow.md) — testing workflow principles
- [secret-scanner](../../secret-scanner/SKILL.md) — must be executed on the diff before any `accepted` decision
- [security-scanner](../../security-scanner/SKILL.md) — must be checked on the diff before any `accepted` decision

Additional skills assigned in the delegations must also be enforced.
