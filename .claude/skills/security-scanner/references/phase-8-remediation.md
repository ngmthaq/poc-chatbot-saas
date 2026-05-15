# Phase 8 — Remediation

**Auto-fix (safe):** `npm audit fix`, `pip install --upgrade <pkg>` for patch-level bumps.

**Verify before applying:** `npm audit fix --force` (may include breaking semver jumps).

**Manual only:** Any finding involving logic — broken auth, IDOR, prompt injection,
SSRF allowlists. Provide: exact file + line, a code diff, and what to test to confirm
the fix is complete.
