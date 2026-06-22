# CLAUDE

Always read all markdown files in the sections below to get complete information about the project, do-do (DO) and don't-do (DO NOT) tasks.

---

## PROJECT OVERVIEW

This section will provide an overview of the project, such as the project name, description, programming language, frameworks, main libraries used, library management platform, and project documentation location - see [PROJECT_OVERVIEW](./PROJECT_OVERVIEW.md).

---

## CODING CONVENTIONS

This section will describe the programming conventions for the project. If agents need to write code, they should follow these conventions to ensure everyone understands and adheres to them - see [CODING_CONVENTIONS](./CODING_CONVENTIONS.md)

---

## AGENT RULES

This section provides information on "DO" and "DO NOT" clauses. Agents should refer to these items to prioritize tasks when receiving assignments from users or to avoid following them when receiving assignments from users - see [AGENT_RULES](./AGENT_RULES.md)

---

## GRAPHIFY

This project has a knowledge graph at `graphify-out/` with god nodes, community structure, and cross-file relationships.

- **graphify** (`.claude/skills/graphify/SKILL.md`) — turns any input into the knowledge graph. Trigger: `/graphify`. When the user types `/graphify`, invoke the Skill tool with `skill: "graphify"` before doing anything else.

Rules:

- For codebase questions, first run `graphify query "<question>"` when `graphify-out/graph.json` exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If `graphify-out/wiki/index.md` exists, use it for broad navigation instead of raw source browsing.
- Read `graphify-out/GRAPH_REPORT.md` only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
