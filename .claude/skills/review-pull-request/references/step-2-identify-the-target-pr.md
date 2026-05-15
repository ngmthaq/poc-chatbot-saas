# Step 2 — Identify the Target PR

Resolve the PR to review using this priority order:

1. **Argument provided** (PR number or URL) → use the MCP tool that fetches a PR by number or URL.
2. **Active PR** → use the MCP tool that returns the currently active PR.
3. **PR in viewport** → use the MCP tool that returns the PR open in the editor viewport.
4. **No PR found** → ask the user: _"Which PR should I review? Please provide a PR number or URL."_

Collect from the resolved PR:

- Title and description (body)
- Author, base branch, head branch
- Labels and linked issues (if any)
