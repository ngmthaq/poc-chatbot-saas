# Step 10 — Offer to Post Review via MCP

After displaying the report, ask:

```markdown
> _"Should I post this review as a comment on PR #[number] using MCP?"_

Review Comments:

| File           | Line | Comment                                                                                        |
| -------------- | ---- | ---------------------------------------------------------------------------------------------- |
| `file.ts`      | 42   | "SRP violation: this function does too much. Need to refactor into smaller functions."         |
| `file.ts`      | 88   | "Avoid interpolating user input directly into SQL queries. Use parameterized queries instead." |
| `file.spec.ts` | 40   | "AAA violation: test name describes implementation details rather than behavior. "             |
```

If confirmed, use the appropriate MCP tool to submit the review comment. Prefer submitting as a **review** (not a plain comment) so line-level annotations are preserved where possible.
