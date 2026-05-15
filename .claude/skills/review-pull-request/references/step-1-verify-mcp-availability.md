# Step 1 — Verify MCP Availability

Search the available tools for any MCP integration that can:

- Fetch a PR/MR by number or URL
- Retrieve the currently active or in-viewport PR
- Read PR diff or file changes

If **no such tool is found** → reply to the user:

> "This skill requires an MCP integration with GitHub, GitLab, or Bitbucket to fetch PR data. No compatible MCP tool was found. Please configure one and retry."

Then **end the session**.
