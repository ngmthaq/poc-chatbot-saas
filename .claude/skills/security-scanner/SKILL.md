---
name: security-scanner
description: >
  Deep, language-agnostic security audit covering dependency vulnerabilities (SCA),
  static code analysis (SAST), application-layer attacks (SQLi, XSS, CSRF, SSRF,
  Command Injection, Broken Auth, Mass Assignment), and AI/LLM-specific threats
  (Prompt Injection, Tool Abuse, Data Exfiltration). Use this skill whenever the
  user asks to scan, audit, review, or harden code — even casually ("check my code
  for security issues", "is this safe?", "any vulnerabilities here?"). Always trigger
  for AI agent/LLM codebases where prompt injection and tool misuse are relevant.
---

# Security Scanner

A structured, repeatable workflow for identifying, classifying, and remediating security
vulnerabilities across any codebase. Covers SCA, SAST, AppSec, API security, and
LLM/AI-specific attack surfaces.

## How to Use This Skill

1. Start with project discovery to map trust boundaries and likely sinks.
2. Run dependency scanning and static analysis for quick automated findings.
3. Perform manual AppSec, API, and AI/LLM review for logic flaws and unsafe flows.
4. Classify findings consistently, recommend fixes, and report them in the standard format.

---

## Scan Workflow

1. [Phase 1 — Project Discovery](./references/phase-1-project-discovery.md)
2. [Phase 2 — Dependency Scanning (SCA)](./references/phase-2-dependency-scanning.md)
3. [Phase 3 — Static Analysis (SAST)](./references/phase-3-static-analysis.md)
4. [Phase 4 — AppSec Deep Audit](./references/phase-4-appsec-deep-audit.md)
5. [Phase 5 — API Security](./references/phase-5-api-security.md)
6. [Phase 6 — AI / LLM Security](./references/phase-6-ai-llm-security.md)
7. [Phase 7 — Risk Classification](./references/phase-7-risk-classification.md)
8. [Phase 8 — Remediation](./references/phase-8-remediation.md)
9. [Phase 9 — Report Format](./references/phase-9-report-format.md)
