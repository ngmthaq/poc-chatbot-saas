---
name: create-pull-request
description: "Create a pull request or merge request with a properly filled template. Use when: opening a PR, creating a MR, submitting code for review, writing a pull request description, generating PR content, preparing a merge request, drafting PR summary from git changes, ticket, or plan."
---

# Create Pull Request

Produces a fully filled pull request / merge request description by discovering the platform template and synthesizing context from git changes, tickets, plans, and user input. If a platform MCP is available, the agent can submit the PR directly.

## When to Use

- Developer wants to open a PR/MR and needs a description
- Auto-filling a PR template from git diff, ticket, or design doc
- Submitting a PR via GitHub / GitLab / Bitbucket MCP integration

---

## Procedure

### Step 1 — Detect the Remote Platform

Run the following and inspect the remote URL to determine the platform:

```bash
git remote get-url origin
```

| URL pattern                        | Platform                       |
| ---------------------------------- | ------------------------------ |
| `github.com`                       | GitHub                         |
| `gitlab.com` or self-hosted GitLab | GitLab                         |
| `bitbucket.org`                    | Bitbucket                      |
| Other / unknown                    | Generic (use default template) |

---

### Step 2 — Find the PR Template

Search for a template based on the detected platform:

| Platform      | Template location(s)                                                     |
| ------------- | ------------------------------------------------------------------------ |
| **GitHub**    | `.github/pull_request_template.md`, `.github/PULL_REQUEST_TEMPLATE/*.md` |
| **GitLab**    | `.gitlab/merge_request_templates/*.md`                                   |
| **Bitbucket** | `.bitbucket/pull_request_template.md`                                    |

**Rules:**

- If **exactly one** template is found → use it automatically.
- If **more than one** template is found → ask the user to pick one before continuing.
- If **no template** is found → use the default: [references/pull-request-template.md](./references/pull-request-template.md).

---

### Step 3 — Determine Target Branch

Run the following to list all branches:

```bash
git branch -a
```

Ask the user: _"Which branch should this PR target (merge into)?"_ and wait for their answer. Use the chosen branch as `<target-branch>` in all subsequent steps.

---

### Step 4 — Gather Context

Collect all available context to fill the template. Use whatever is provided:

| Source                | How to collect                                                                         |
| --------------------- | -------------------------------------------------------------------------------------- |
| **Git changes**       | `git diff <target-branch>...HEAD`; also `git log <target-branch>...HEAD --oneline`     |
| **User input**        | The argument passed when invoking this skill (ticket URL, requirement text, plan link) |
| **Plan / design doc** | Read any linked `.md` planning files in the workspace                                  |
| **Ticket**            | If a URL is provided, fetch the ticket content                                         |

---

### Step 5 — Fill the Template

Using the collected context, fill every section of the chosen template:

- **Description**: Summarize _what_ and _why_ in plain language.
- **Type of Change**: Check the most appropriate box(es).
- **Changes Made**: List concrete changes derived from the git diff / plan.
- **How to Test**: Write actionable steps a reviewer can follow.
- **Checklist**: Check items that are verifiably satisfied; leave unchecked items for the developer to confirm.
- **Related Issues**: Insert ticket/issue references (e.g., `Closes #123`).
- **Screenshots**: Note if screenshots are not applicable, or prompt the user to add them.

Do **not** leave placeholder comments unfilled if the context is sufficient to answer them.

---

### Step 6 — Submit or Return

Check whether an MCP integration is available for the detected platform:

| Platform  | MCP tool to check                                                  |
| --------- | ------------------------------------------------------------------ |
| GitHub    | `github-pull-request_create_pull_request` or equivalent GitHub MCP |
| GitLab    | GitLab MCP (merge request creation tool)                           |
| Bitbucket | Bitbucket MCP (pull request creation tool)                         |

**If MCP is available:**

1. Show the user the filled template for review.
2. Ask: _"Should I create this pull request now using the [Platform] integration?"_
3. If confirmed, invoke the MCP tool to create the PR/MR targeting `<target-branch>` with the filled description.
4. Report the PR/MR URL back to the user.

**If MCP is not available:**

- Return the fully filled PR description as a fenced Markdown block so the user can copy-paste it directly into their platform.

---

## Notes

- User **must** commit their changes before invoking this skill, as it relies on `git diff` to gather context.
- Always use the target branch chosen by the user in **Step 3** as the base branch for the diff and PR.
- If the git diff is very large (>300 lines), summarize by file/module instead of listing every line.
- Never include secrets, credentials, or internal environment values in the PR description.
