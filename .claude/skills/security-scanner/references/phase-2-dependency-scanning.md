# Phase 2 — Dependency Scanning (SCA)

```bash
npm audit --json                      # Node.js
pip-audit --format=json               # Python
govulncheck ./...                     # Go
dotnet list package --vulnerable      # .NET
bundle-audit check --update           # Ruby
mvn dependency-check:check            # Java
```

Flag CVEs with CVSS ≥ 7.0, transitive vulnerabilities, and pinned versions with no upstream
fix. Downgrade severity for `devDependencies` that never reach production.
