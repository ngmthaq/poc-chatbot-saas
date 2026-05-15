# Step 4 — Check Requirements Conformance

Using the PR title, description (body), and linked issues collected in Step 2, cross-reference the diff to answer:

| Question                                                                          | How to check                                                                          |
| --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| Does every requirement stated in the description have corresponding code changes? | Map each stated goal / acceptance criterion to at least one changed file or function. |
| Are there code changes that are not explained by the description?                 | Flag unexplained changes — they may be unrelated or risky.                            |
| Does the PR description match what the code actually does?                        | Note any mismatch between the stated intent and the implementation.                   |
| Are linked issues / tickets addressed?                                            | If issue references are present, verify the related behavior is implemented.          |

For each gap or mismatch found, record:

- **Requirement** (quoted from the description or issue)
- **Status**: `Missing` / `Partial` / `Mismatch` / `Unexplained change`
- **Details** (which files or logic are involved)
