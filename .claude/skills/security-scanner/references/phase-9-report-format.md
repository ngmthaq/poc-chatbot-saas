# Phase 9 — Report Format

```text
[SEC-NNN] <Vulnerability Class>
Severity : CRITICAL | HIGH | MEDIUM | LOW | INFO
Location : <file>:<line>      CWE: CWE-<N>
Summary  : One-sentence description of what is wrong.
Impact   : What an attacker achieves on successful exploitation.
Evidence : Vulnerable code snippet.
Fix      : Remediation with code example.
Effort   : Low | Medium | High
```

Conclude every scan with a summary block:

```text
Security Scan Summary
=====================
Findings — CRITICAL: N  HIGH: N  MEDIUM: N  LOW: N  INFO: N

Top Issues:
  1. [CRITICAL] SQL Injection       — userService.js:87
  2. [HIGH]     Prompt Injection    — summaryAgent.js:34
  3. [HIGH]     Broken Auth         — invoiceRouter.js:61
```
