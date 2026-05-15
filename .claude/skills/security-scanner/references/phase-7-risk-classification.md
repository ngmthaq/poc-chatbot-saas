# Phase 7 — Risk Classification

| Severity                | Criteria                                                                  | CI Gate                 |
| ----------------------- | ------------------------------------------------------------------------- | ----------------------- |
| **CRITICAL**            | Remotely exploitable, no auth required (e.g. unauthed SQLi, RCE)          | Block merge             |
| **HIGH**                | Realistic attack, significant impact (e.g. authed SQLi, SSRF, stored XSS) | Warn; requires approval |
| **MEDIUM**              | Limited scope or requires specific conditions                             | Report only             |
| **LOW**                 | Best-practice gap, defense-in-depth                                       | Report only             |
| **INFO**                | Hygiene / observability issue                                             | Report only             |
| **NEEDS MANUAL REVIEW** | Sink reachable but input shape unclear from static analysis               | Escalate before merge   |

Downgrade if the code path is behind sound authentication. Upgrade if the finding is in
a payment flow, auth system, or PII handler.
