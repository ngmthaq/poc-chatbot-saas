# Workflow Diagram

```mermaid
sequenceDiagram
    actor User
    participant Root as Root Agent
    participant Planner as planner (sub-agents)
    participant Debugger as debugger (sub-agents)
    participant Developer as developer (sub-agents)
    participant Tester as tester (sub-agents)
    participant Reviewer as reviewer (sub-agents)

    User->>Root: Prompt (feature / bug)

    alt is feature (refactor)
        Root->>Planner: Spawn sub-agent (load planner skill, plan-mode)
        Planner-->>Root: Plan response template
    else is bug
        Root->>Debugger: Spawn sub-agent (load debugger skill, plan-mode)
        Debugger-->>Root: Plan response template
    end

    Root->>User: Present plan for approval
    alt user requests changes
        User-->>Root: Feedback / revision request
        Root->>Planner: Re-spawn with user feedback (or debugger for bug)
        Planner-->>Root: Updated plan response template
        Root->>User: Present revised plan for approval
    end
    User-->>Root: Approved

    loop Until complete (max 3 iterations)
            par parallel sub-agents
                Root->>Developer: Spawn (load developer skill, acceptEdits)
                Developer-->>Root: Sub-agent result template
            and
                Root->>Tester: Spawn (load tester skill, acceptEdits)
                Tester-->>Root: Sub-agent result template
            end

            alt result is incomplete or requirements unclear
                Note over Root: Re-plan with failure context
                Root->>Planner: Re-spawn (or debugger for bug)
                Planner-->>Root: Updated plan response template
            else result is complete
                loop Until accepted (max 2 reviewer blocks)
                    Root->>Reviewer: Spawn (load reviewer skill)
                    alt reviewer blocked
                        Reviewer-->>Root: Blocked — issues found
                        Root->>Developer: Re-spawn with reviewer feedback
                        Developer-->>Root: Sub-agent result template
                    else reviewer accepted
                        Reviewer-->>Root: Accepted
                    end
                end
            end
        end

        Root->>User: Summary report (work done, files changed, tests updated)
```

> **Parallel-by-default**: developer and tester can run concurrently when the project's testing workflow is `Test-First` (tester writes specs from the requirement) or when developer and tester scopes don't overlap. When `Code-First` and the tester depends on the developer's diff, run them sequentially.
