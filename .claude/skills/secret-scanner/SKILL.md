---
name: secret-scanner
description: "Secret Scanner — Detects and prevents hardcoded secrets in code, configuration, and documentation. Enforces security best practices and integrates with CI/CD pipelines for proactive secret management."
---

# Secret Scanner

## When to Use

- During code reviews to identify hardcoded secrets
- As part of CI/CD pipelines to prevent secret leaks
- When auditing existing codebases for security risks

---

## Agent Execution Instructions

When this skill is invoked, the agent **MUST** execute the following steps using its bash/shell tool — do not simulate or summarise, actually run the commands:

1. **Make the script executable:**

   ```bash
   chmod +x path/to/skills/scripts/scan-secrets.sh
   ```

2. **Run the scanner against the current code change:**

   ```bash
   git diff --cached | path/to/skills/scripts/scan-secrets.sh --diff
   ```

   If no staged changes exist, fall back to unstaged:

   ```bash
   git diff | path/to/skills/scripts/scan-secrets.sh --diff
   ```

3. **Report results** — present each finding with its type, location, severity, and fix. If exit code is `0`, confirm the change is clean.

4. **Block completion** — do not mark the task complete or approve the code change if exit code is `1`.

---

## Scanning with `scan-secrets.sh`

All detection patterns are encoded in **`path/to/skills/scripts/scan-secrets.sh`**. Always run the script against the code change (diff) — not the full codebase — to keep CI fast and output focused.

### Scan a code change (recommended)

```bash
# Staged changes (pre-commit / pre-merge)
git diff --cached | path/to/skills/scripts/scan-secrets.sh --diff

# Unstaged changes
git diff | path/to/skills/scripts/scan-secrets.sh --diff

# Last commit (post-merge check)
git show | path/to/skills/scripts/scan-secrets.sh --diff
```

The `--diff` mode reads a unified diff from stdin and **only inspects added lines** (`+` prefix), ignoring removed lines and context. This targets exactly what is being introduced.

### Scan specific files (fallback)

```bash
path/to/skills/scripts/scan-secrets.sh path/to/file.env path/to/config.py
```

### Exit codes

| Code | Meaning                                 |
| ---- | --------------------------------------- |
| `0`  | No secrets detected                     |
| `1`  | One or more secrets found — block merge |

---

## Enforcement Rules

- Any detected secret **must** be treated as a critical security issue.
- Output always includes: secret type, file path and line number, severity, and remediation guidance.
- **Do not mark code as secure** until all critical and high-severity findings are resolved.
- Remediation: remove the hardcoded value and replace with an environment variable or secrets manager reference (e.g. AWS Secrets Manager, HashiCorp Vault, GitHub Actions secrets).
