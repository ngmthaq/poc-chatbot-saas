# Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant Root as Root Agent
    participant Developer as developer (sub-agents)
    participant Tester as tester (sub-agents)

    User->>Root: Prompt (feature / bug)

    loop Brainstorming — until no open questions remain
        Root->>User: Clarify intent, scope, open questions
        User-->>Root: Answers
    end

    Note over Root: Create plan (plan template, read-only)
    Root->>User: Present plan for approval

    alt user requests changes
        User-->>Root: Feedback / revision request
        Note over Root: Return to brainstorming, revise plan
        Root->>User: Present revised plan for approval
    end
    User-->>Root: Approved

    loop Until accepted (loop guard applies)
        par parallel sub-agents
            Root->>Developer: Spawn (load developer skill, acceptEdits)
            Developer-->>Root: Sub-agent result template
        and
            Root->>Tester: Spawn (load tester skill, acceptEdits)
            Tester-->>Root: Sub-agent result template
        end

        alt result has open questions
            Note over Root: Answer from plan/context — or ask the user
            Root->>User: Open question (only if not on record)
            User-->>Root: Answer
            Root->>Developer: Re-spawn with answers (or tester)
        else result is incomplete or blocked
            Note over Root: Resolve blocker, re-plan if needed
            Root->>Developer: Re-spawn with updated context (or tester)
        else result is complete
            Note over Root: Root Agent reviews — approved plan,<br/>conventions, security, business logic
            alt review not fully qualified
                Root->>Developer: Re-spawn with review feedback (or tester, per Responsible Role)
                Developer-->>Root: Sub-agent result template
            else review accepted
                Note over Root: Proceed to summary report
            end
        end
    end

    Root->>User: Summary report (work done, files changed, tests updated)
```

> **Parallel-by-default**: developer and tester can run concurrently when the project's testing workflow is `Test-First` (tester writes specs from the requirement) or when developer and tester scopes don't overlap. When `Code-First` and the tester depends on the developer's diff, run them sequentially.
