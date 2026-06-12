---
name: party-mode
description: User-invoked orchestration skill. Load ONLY when the user explicitly runs the `/party-mode` slash command (or otherwise tells the agent to "follow the party-mode"). Defines how the Root Agent brainstorms with the user, plans, spawns developer/tester sub-agents via the host's sub-agent tool, reviews their output, and reports. DO NOT auto-load on every user prompt.
---

> **Activation rule:** This skill is **opt-in**. The Root Agent must not run this workflow on every user message — only when the user invokes `/party-mode` explicitly (or restates the equivalent in plain language). For all other prompts, the agent answers directly without spawning developer/tester sub-agents.

# Party-Mode

The orchestration contract for the **Root Agent**. The Root Agent brainstorms with the user, plans, delegates implementation, reviews, and reports. All implementation work is performed by **ephemeral sub-agents** spawned on demand via the host's sub-agent tool — **developer** and **tester** are the only sub-agent roles. Planning and review are the Root Agent's own responsibility; no planner, debugger, or reviewer sub-agents are spawned.

> Sub-agents in this project are **skill-bound**, not file-bound. The Root Agent picks the right role skill and passes it inline when spawning the sub-agent.

---

## Sub-Agent Roles (load via [sub-agents](./references/sub-agents.md) skill)

Only the **Root Agent** delegates. Sub-agents never spawn other sub-agents. The plan flags each task with a `Responsible Role` (developer or tester), and the Root Agent's review flags each issue with a `Responsible Role` — both are routing hints used by the Root Agent to build and target delegations.

---

## Workflow

> Diagram reference: [workflow-diagram](./references/workflow-diagram.md)

---

## Step-by-Step Instructions

1. [Step 1 — Brainstorming](./references/step-1-brainstorming.md)
2. [Step 2 — Planning](./references/step-2-planning.md)
3. [Step 3 — User Approval Gate](./references/step-3-approval-gate.md)
4. [Step 4 — Delegation to Sub-Agents](./references/step-4-delegation.md)
5. [Step 5 — Sub-Agent Result Return](./references/step-5-result-return.md)
6. [Step 6 — Review](./references/step-6-review.md)
7. [Step 7 — Summary Report to User](./references/step-7-summary-report.md)

---

## Loop Guard

To prevent infinite loops, the Root Agent tracks **loop iterations per session**.

- After **3 consecutive incomplete cycles** on the same task → surface blockers to the user and request clarification.
- After **2 consecutive failed reviews** on the same output → surface the review findings and ask whether to proceed or abort.

---

## Constraints

- **Only the Root Agent delegates.** The plan flags a `Responsible Role` per task and the review flags a `Responsible Role` per issue — both are routing hints for the Root Agent's delegations. Sub-agents never spawn or message other sub-agents.
- **Root Agent never implements.** It brainstorms, plans, delegates, reviews, and reports — but never edits production or test files. Those belong to the developer and tester sub-agents.
- **Brainstorming before planning.** Every open question must be answered by the user before a plan is written. No assumptions, no placeholders.
- **Approval gate is non-negotiable.** No implementation sub-agent runs until the user has approved a plan. Plan changes loop back to brainstorming.
- **Root Agent is the sole verification gate.** Developer and tester output is reviewed by the Root Agent at Step 6 — against the approved plan, project conventions, security, and business logic. The tester does not judge the developer's work, and sub-agents do not judge each other.
- **Always spawn a sub-agent for feature, refactor, or bug work** — the Root Agent never edits production or test files directly for those classifications.
- **Run independent sub-agents in parallel** by issuing multiple spawn calls in the same tool turn.
- **Sub-agents ask, never guess.** A sub-agent that cannot proceed returns `Open Questions` to the Root Agent, which answers from the plan/context or asks the user, then re-delegates.
- **No silent failures.** Any sub-agent returning `incomplete` or `blocked` must be surfaced — not paved over.
