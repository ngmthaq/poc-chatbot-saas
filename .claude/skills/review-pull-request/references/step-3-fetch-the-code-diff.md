# Step 3 — Fetch the Code Diff

Retrieve the full diff / file-level changes for the PR using the access method chosen in Step 1.

## Using MCP

Use the available MCP tool to retrieve the diff / file-level changes.

## Using the CLI

| Platform  | Diff command                              |
| --------- | ----------------------------------------- |
| GitHub    | `gh pr diff <number-or-url>`              |
| GitLab    | `glab mr diff <number-or-url>`            |
| Bitbucket | `bb pr diff <number>` (flags vary by CLI) |

**Large diffs (>400 changed lines):** Summarize by file/module instead of line-by-line.

Identify from the diff:

- Which files are modified/added/deleted
- Whether any test files are present (e.g., `*.test.*`, `*.spec.*`, `*_test.*`, files under `tests/`, `__tests__/`, `spec/`)
- Language(s) and framework(s) in use

> Capture the diff hunks with their line numbers — Step 10 posts comments anchored to specific files and lines, so you need the post-change line numbers for each finding.
