# GitNexus Integration

[GitNexus](https://github.com/abhigyanpatwari/GitNexus) indexes your entire codebase into a knowledge graph — every dependency, call chain, cluster, and execution flow — then exposes it through smart tools so AI agents never miss code context.

**Important:** GitNexus generates `AGENTS.md` and `CLAUDE.md`. Follow the steps below to avoid overwriting these root instructions.

## Installation & Setup

1. Install GitNexus following its [README instructions](https://github.com/abhigyanpatwari/GitNexus).

2. Run GitNexus in your project root. It will generate `AGENTS.md` and `CLAUDE.md`.

3. Rename both generated files to avoid conflicts with the existing `ai-kit` files:

   ```sh
   mv AGENTS.md .claude/GIT_NEXUS.md
   rm CLAUDE.md
   ```

4. Add a reference to `GIT_NEXUS.md` inside your existing `CLAUDE.md` (or `.claude/CLAUDE.md`) so the AI agent picks up the knowledge graph context alongside your existing configuration:

```markdown
## Codebase Knowledge Graph

See [GIT_NEXUS.md](../GIT_NEXUS.md) for the auto-generated codebase index produced by GitNexus, covering dependencies, call chains, clusters, and execution flows.
```

Adjust the relative path depending on where your `CLAUDE.md` lives (e.g. `.claude/CLAUDE.md` → `../GIT_NEXUS.md`; root `CLAUDE.md` → `./GIT_NEXUS.md`).

5. Commit `GIT_NEXUS.md` and the updated `CLAUDE.md` together:

   ```sh
   git add GIT_NEXUS.md CLAUDE.md   # or .claude/CLAUDE.md
   git commit -m "chore: add GitNexus codebase index as GIT_NEXUS.md"
   ```
