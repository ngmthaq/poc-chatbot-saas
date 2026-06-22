# Step 2 — Identify the Target PR

Resolve the PR whose comments you will address, using this priority order:

1. **Argument provided** (PR number or URL) → use that PR.
2. **Active / viewport PR** (MCP only) → use the MCP tool that returns the currently active PR or the PR open in the editor viewport.
3. **Current branch's PR** → resolve the PR for the checked-out branch.
4. **No PR found** → ask the user: _"Which PR's comments should I resolve? Please provide a PR number or URL."_

## Using MCP

Use the MCP tool that fetches a PR by number/URL, or returns the active/viewport PR.

## Using the CLI

| Platform  | Resolve PR by number/URL                  | Current branch's PR     |
| --------- | ----------------------------------------- | ----------------------- |
| GitHub    | `gh pr view <number-or-url> --json ...`   | `gh pr view --json ...` |
| GitLab    | `glab mr view <number-or-url>`            | `glab mr view`          |
| Bitbucket | `bb pr view <number>` (flags vary by CLI) | per-CLI                 |

Collect from the resolved PR:

- Number, title, author
- Base branch and **head branch** (you will need to check this branch out before applying fixes)
- The head commit SHA (needed to reply to / anchor comments)
- Whether the PR is open and mergeable

> Tip (GitHub): `gh pr view <n> --json number,title,headRefName,baseRefName,headRefOid,state` returns these fields in one call.
