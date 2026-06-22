# Step 1 — Verify Access Method (MCP or CLI)

Determine how to read reviewer comments, push changes, and post replies, in this order of preference. This skill needs an access method that can both **read review comments** and **reply to / resolve** them.

## Tier 1 — Platform MCP (preferred)

Search the available tools for any MCP integration that can:

- Fetch a PR/MR by number or URL (or the currently active / in-viewport PR)
- Read PR **review comments / discussion threads** (file + line, body, author, resolved state)
- Reply to a review comment thread and mark it resolved

If such a tool is found → use **MCP** for the remaining steps.

## Tier 2 — Platform CLI (fallback)

If no compatible MCP tool is found, detect the platform from the remote and check for its CLI:

```bash
git remote get-url origin
```

| Remote pattern  | Platform  | CLI    | Availability check                                 | Auth check         |
| --------------- | --------- | ------ | -------------------------------------------------- | ------------------ |
| `github.com`    | GitHub    | `gh`   | `command -v gh`                                    | `gh auth status`   |
| `gitlab.*`      | GitLab    | `glab` | `command -v glab`                                  | `glab auth status` |
| `bitbucket.org` | Bitbucket | `bb`   | `command -v bb` (or other installed Bitbucket CLI) | per-CLI            |

If the platform CLI is installed and authenticated → use the **CLI** for the remaining steps.

If the CLI exists but is **not authenticated**, tell the user how to authenticate (e.g. `gh auth login`, `glab auth login`) and stop until resolved.

## Neither available

If neither an MCP nor a platform CLI is available → reply to the user:

> "This skill needs either an MCP integration or a platform CLI (`gh`, `glab`, or a Bitbucket CLI) to read and resolve PR comments. None was found. Please configure one and retry."

Then **end the session**.
