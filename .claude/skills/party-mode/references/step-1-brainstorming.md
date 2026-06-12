# Step 1 — Brainstorming (Root Agent)

When a user prompt arrives, the Root Agent **must greet the user, classify the intent, and brainstorm the requirement with the user** before anything else. Brainstorming is an interactive dialogue — the Root Agent clarifies intent, classifies the request, explores the relevant codebase context, and surfaces every open question **before** any plan is written.

> The Root Agent runs brainstorming itself — no sub-agent is spawned at this stage.

---

## Classify the Intent

Classification shapes the brainstorming questions and the eventual plan structure.

### Feature

Classify as `feature` when the prompt describes:

- New functionality to be added
- Agent skill additions or modifications that add new capabilities
- An existing behaviour to be refactored or improved
- A performance improvement with no broken behaviour involved
- A non-breaking change that adds value or enhances the user experience
- A change that is explicitly framed as a "feature" by the user

**Signal words:** "add", "implement", "create", "build", "refactor", "improve", "migrate", "support", "enable", "integrate"

### Bug

Classify as `bug` when the prompt describes:

- Something that was working and is now broken
- Unexpected or incorrect behaviour
- A crash, error, or exception
- A regression introduced by a recent change
- Output that does not match the specification
- A change that is explicitly framed as a "bug" by the user

**Signal words:** "broken", "not working", "fails", "error", "crash", "wrong", "incorrect", "regression", "unexpected", "should be", "used to work"

### Ambiguous Cases

**Rule: ALWAYS ask the user. Never assume.**

If the prompt contains signals for both `feature` and `bug`, or if intent cannot be determined with confidence, ask the user a direct, specific question before proceeding. Do not guess, infer, or proceed with a best-effort classification.

---

## Brainstorming Dialogue

1. **Greet the user and restate the request** in your own words so misunderstandings surface immediately. User prompts can be confusing or contain spelling errors — analyze and clarify them.
2. **Classify the intent** (`feature` or `bug`) using the rules above.
3. **Explore the codebase context.** Read the relevant files, modules, and conventions (read-only). Reference real paths — do not invent files.
4. **Load relevant documents.** Scan the **Documents Folder** for previous plans or memory items related to this request.
5. **Scan the `skills/` directory** and note every skill relevant to the request domain — these will be assigned to sub-agents later.
6. **Gather classification-specific details:**
   - For a `feature`: scope, expected behaviour, affected areas, constraints, what is explicitly out of scope.
   - For a `bug`: observed behaviour (error messages, stack traces, logs), expected behaviour, and reproduction steps. Walk through the reproduction steps against the codebase to identify the suspected root cause.
7. **Surface every open question to the user.** List each unclear item as a direct, specific question — intent, scope, affected area, expected behaviour, constraints. **STOP and wait** for the user to answer every open question before moving to planning.
8. **Iterate.** If the user's answers raise new questions, ask again. Brainstorming ends only when the Root Agent can state the requirement with no remaining ambiguity.

---

## Usage Notes

- Brainstorming is always the **first action** of the Root Agent. No planning, delegation, or execution happens before it.
- **ALWAYS ask the user when anything is unclear** — there are no acceptable assumptions.
- The Root Agent also returns to this step when the user requests plan changes at the approval gate (Step 3).
- A request that cannot be clarified must be treated as blocked until the user answers — never proceed with placeholders.
