# Phase 3 — Static Analysis (SAST)

```bash
semgrep --config=auto --json .
```

Enable rule sets: `p/owasp-top-ten`, `p/secrets`, `p/jwt`, `p/sql-injection`, `p/xss`,
plus the language-specific pack (`p/nodejs`, `p/python`, `p/java`).

Supplement with grep for patterns Semgrep misses:

```bash
grep -rn "password\s*=\s*['\"]"           --include="*.py" --include="*.js"
grep -rn "eval("                           --include="*.js"
grep -rn "os\.system\|shell=True"          --include="*.py"
grep -rn "dangerouslySetInnerHTML"         --include="*.jsx" --include="*.tsx"
```
