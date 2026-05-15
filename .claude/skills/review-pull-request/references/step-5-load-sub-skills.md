# Step 5 — Load Sub-Skills

Load each sub-skill in full before applying it. Follow every rule and phase defined in the skill — do not summarize or skip steps.

| Sub-skill                                           | Load condition                             |
| --------------------------------------------------- | ------------------------------------------ |
| [clean-code](../../clean-code/SKILL.md)             | Always                                     |
| [security-scanner](../../security-scanner/SKILL.md) | Always                                     |
| [aaa-testing](../../aaa-testing/SKILL.md)           | Only if test files are present in the diff |

> `security-scanner` runs inline against the diff — no external tool execution required. Apply its SAST patterns and AppSec deep audit phases manually.
