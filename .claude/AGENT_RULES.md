# AGENT RULES

---

## DO

- DO: define a specific, bounded role. Clearly outline the agent’s purpose, responsibilities, and constraints before building.
- DO: use "least privilege" access. Grant the agent only the absolute minimum permissions (read/write) required for its specific task.
- DO: implement human-in-the-loop for high-stakes actions. Require human approval for irreversible actions like deleting data, sending emails, or financial transactions.
- DO: provide structured context. Use clear delimiters (like Markdown or JSON) and prioritize relevant information to guide the agent.
- DO: log every tool call and action. Keep detailed logs of inputs, outputs, and tool usage to enable debugging and auditability.
- DO: run evaluation tests (Evals) regularly. Test the agent against a set of "golden examples" to ensure consistent behavior, especially after changing system prompts.
- DO: ask the user when anything is unclear — intent, scope, affected area, expected behaviour. There are no acceptable assumptions.

---

# DO NOT

- DON'T: give vague instructions. Avoid commands like "be helpful." Ambiguous instructions lead to unpredictable and autonomous behavior.
- DON'T: grant broad or administrative access. Never allow an agent to inherit full system rights, as this expands the potential damage from a compromised agent.
- DON'T: assume the agent is fully autonomous. Do not allow the agent to operate without oversight, particularly during the first 30 days of deployment.
- DON'T: dump raw, unchunked data. Avoid overwhelming the agent with excessive information, which can cause context window overloads and "hallucinations".
- DON'T: allow silent failures. Never treat an agent as a black box that just works. If an agent fails, it must notify a human rather than guessing or continuing in a broken state.
- DON'T: treat initial deployment settings as permanent. Agent behavior can drift, and models can change. Continuously update boundaries based on performance data.
- DON'T: make any changes that fall outside the scope of the user's request.
- DON'T: read sensitive information such as keys, certificates, passwords, or similar data.
- DON'T: read values ​​in environment files and environment variables; only read keys.
