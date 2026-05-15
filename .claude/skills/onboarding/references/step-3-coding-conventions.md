# Step 3 — Coding Conventions

**Goal:** Read [CODING_CONVENTIONS.md](../../../CODING_CONVENTIONS.md) to check for existing information. Discover and document the project's coding standards. Write approved results to [CODING_CONVENTIONS.md](../../../CODING_CONVENTIONS.md).

1. **Scan** the repository for convention signals:
   - Naming: camelCase, snake_case, PascalCase for files, variables, functions, classes
   - Folder structure patterns: feature-based, layer-based, or domain-based
   - Import style: absolute versus relative paths, barrel exports (`index.ts`)
   - Style config files: `.eslintrc.*`, `.prettierrc.*`, `pyproject.toml [tool.ruff]`, `.editorconfig`, `rustfmt.toml`
   - Documentation style: JSDoc, Python docstrings, inline comments
   - Error handling patterns: try/catch, Result types, error boundaries
   - State management patterns, if applicable

2. **Present** the discovered conventions to the user and ask:

   > "Here are the coding conventions I found. Do you want to modify anything or approve them as-is?"

3. **Only after user approval**, write the conventions to [CODING_CONVENTIONS.md](../../../CODING_CONVENTIONS.md).
