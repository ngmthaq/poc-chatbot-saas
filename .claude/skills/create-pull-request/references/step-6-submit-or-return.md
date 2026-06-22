# Step 6 — Submit or Return

Submit the PR/MR using the best available method, in this order of preference:

1. **Platform MCP** (preferred — richest integration)
2. **Platform CLI** (fallback when no MCP)
3. **Manual copy-paste** (last resort)

## Tier 1 — Platform MCP (preferred)

Check whether an MCP integration is available for the detected platform:

| Platform  | MCP tool to check                                                  |
| --------- | ------------------------------------------------------------------ |
| GitHub    | `github-pull-request_create_pull_request` or equivalent GitHub MCP |
| GitLab    | GitLab MCP (merge request creation tool)                           |
| Bitbucket | Bitbucket MCP (pull request creation tool)                         |

If MCP is available:

1. Show the user the filled template for review.
2. Ask: _"Should I create this pull request now using the [Platform] integration?"_
3. If confirmed, invoke the MCP tool to create the PR/MR targeting `<target-branch>` with the filled description.
4. Report the PR/MR URL back to the user.

## Tier 2 — Platform CLI (fallback)

If no MCP is available, check whether the platform's CLI (matching the platform detected in [Step 1](./step-1-detect-platform.md)) is installed and authenticated:

| Remote pattern  | Platform  | CLI    | Availability check                                 | Auth check         |
| --------------- | --------- | ------ | -------------------------------------------------- | ------------------ |
| `github.com`    | GitHub    | `gh`   | `command -v gh`                                    | `gh auth status`   |
| `gitlab.*`      | GitLab    | `glab` | `command -v glab`                                  | `glab auth status` |
| `bitbucket.org` | Bitbucket | `bb`   | `command -v bb` (or other installed Bitbucket CLI) | per-CLI            |

If the CLI is available and authenticated:

1. Show the user the filled template for review.
2. Ask: _"Should I create this pull request now using `<cli>`?"_
3. If confirmed, write the filled description to a temporary file (avoids shell-escaping issues with multi-line Markdown) and run the create command targeting `<target-branch>`:

   **GitHub**

   ```bash
   gh pr create --base <target-branch> --title "<title>" --body-file <tmpfile>
   ```

   **GitLab**

   ```bash
   glab mr create --target-branch <target-branch> --title "<title>" --description "$(cat <tmpfile>)"
   ```

   **Bitbucket** — use the installed CLI's create command (flags vary by tool); for the common `bb` CLI:

   ```bash
   bb pr create --target <target-branch> --title "<title>" --description "$(cat <tmpfile>)"
   ```

4. Clean up the temporary file.
5. Report the PR/MR URL printed by the CLI back to the user.

If the CLI exists but is **not authenticated**, tell the user how to authenticate (e.g. `gh auth login`, `glab auth login`) and offer to fall back to Tier 3.

## Tier 3 — Manual copy-paste (last resort)

If neither MCP nor a CLI is available:

- Return the fully filled PR description as a fenced Markdown block so the user can copy-paste it directly into their platform.
