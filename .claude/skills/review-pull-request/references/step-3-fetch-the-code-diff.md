# Step 3 — Fetch the Code Diff

Use the available MCP tool to retrieve the full diff / file-level changes for the PR.

**Large diffs (>400 changed lines):** Summarize by file/module instead of line-by-line.

Identify from the diff:

- Which files are modified/added/deleted
- Whether any test files are present (e.g., `*.test.*`, `*.spec.*`, `*_test.*`, files under `tests/`, `__tests__/`, `spec/`)
- Language(s) and framework(s) in use
