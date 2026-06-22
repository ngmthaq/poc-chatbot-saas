# Step 5 — Resolve via Party-Mode

The actual fixes are applied through the **party-mode** orchestration workflow. The Root Agent never edits files itself — every change is delegated to developer/tester sub-agents and reviewed by the Root Agent.

## Check out the PR branch first

Before any fix is applied, make sure the work happens on the PR's head branch (from Step 2):

```bash
gh pr checkout <number>     # GitHub
# or: git fetch origin <head-branch> && git switch <head-branch>
```

Confirm the working tree is clean before delegating.

## Hand the triage list to party-mode

Load the [party-mode](../../party-mode/SKILL.md) skill and run its workflow, using the **`resolve` rows from the Step 4 triage table** as the requirement. Map this skill's steps onto party-mode's:

1. **Brainstorming** — Present each reviewer request as the requirement. Resolve any comment carried forward as an open question with the user (or by re-reading the reviewer's intent). Classify each as `feature` or `bug` per the Step 4 tags.
2. **Planning** — The Root Agent writes a plan whose **Task List** has one entry per reviewer request (or per group), each flagged with a `Responsible Role` (developer or tester) and the originating **comment IDs**.
3. **Approval gate** — Present the plan and **wait for explicit user approval**. No fix is applied before approval. This gate is non-negotiable.
4. **Delegation** — Spawn developer/tester sub-agents to apply the changes; run independent tasks in parallel.
5. **Result return + Review** — The Root Agent reviews every sub-agent result against the reviewer's original comment, project conventions, and the plan. Re-delegate any task that does not fully address its comment.
6. **Summary** — party-mode reports per-task results back here.

## Pass-through rules

- Every party-mode task must trace back to one or more **comment IDs** so Step 6 can reply to the right threads.
- A reviewer request is only "done" when the Root Agent's review accepts the change **and** it genuinely addresses what the comment asked for — not merely that code changed.
- If a task stays `incomplete` or `blocked` after party-mode's loop guard trips, surface it; do not mark its thread resolved in Step 6.
