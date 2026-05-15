# Step 9 — Produce the Review Report

Assemble a single structured Markdown report using the template below.

```markdown
## PR Review — [PR Title] (#[number])

**Author:** [author]  
**Base ← Head:** `[base-branch]` ← `[head-branch]`  
**Files changed:** [count]  
**Tests present:** Yes / No

---

### Summary

[2–4 sentence overview: overall quality, risk level, and whether the PR is ready to merge, needs minor changes, or needs major changes.]

---

### Requirements Conformance

| #   | Requirement | Status                                     | Details |
| --- | ----------- | ------------------------------------------ | ------- |
| 1   | ...         | Missing / Partial / Mismatch / Unexplained | ...     |

---

### Clean Code

#### Findings

| #   | File      | Line(s) | Principle | Description |
| --- | --------- | ------- | --------- | ----------- |
| 1   | `file.ts` | 42–55   | SRP       | ...         |

#### Suggestions

[List concrete refactors for the top 3–5 most impactful findings.]

---

### Security

#### Findings

| #   | Severity | File      | Line(s) | Category      | Description |
| --- | -------- | --------- | ------- | ------------- | ----------- |
| 1   | HIGH     | `file.ts` | 88      | SQLi (CWE-89) | ...         |

#### Remediations

[Provide code-level fixes for all CRITICAL and HIGH findings.]

---

### Testing _(omit section if no test files in diff)_

#### AAA Violations

| #   | File           | Test Name    | Violation                                                                 |
| --- | -------------- | ------------ | ------------------------------------------------------------------------- |
| 1   | `user.test.ts` | `test_login` | AAA violation: name describes implementation details rather than behavior |

#### Coverage Gaps

[List new logic from the diff that lacks test coverage.]

---

### Verdict

| Dimension    | Status                                                                           |
| ------------ | -------------------------------------------------------------------------------- |
| Requirements | ✅ Fully addressed / ⚠️ Partially addressed / ❌ Missing or mismatched           |
| Clean Code   | ✅ Approved / ⚠️ Minor issues / ❌ Major issues                                  |
| Security     | ✅ No findings / ⚠️ Low/Medium only / ❌ Critical/High findings                  |
| Testing      | ✅ Adequate / ⚠️ Gaps noted / ❌ Missing / ➖ N/A                                |
| **Overall**  | ✅ **Approve** / ⚠️ **Request Changes (minor)** / ❌ **Request Changes (major)** |
```

> - Use `✅` only when a dimension has zero findings or only cosmetic issues.
> - Use `⚠️` for findings that should be addressed but are not blockers.
> - Use `❌` when there is at least one CRITICAL/HIGH security finding, a major architectural violation, or tests are entirely absent for new logic.
> - Overall verdict is the **worst** of the applicable dimensions.
