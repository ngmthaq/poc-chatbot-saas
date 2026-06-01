# GitNexus Integration

- GitNexus indexes your entire source code into a knowledge graph—every dependency, function call chain, function cluster, and execution flow—and then exposes it through intelligent tools so that AI agents never miss the code context. Follow the instructions in [README.md](https://github.com/abhigyanpatwari/GitNexus/blob/main/README.md) to set up GitNexus in your repository.

- Run this command to install GitNexus globally: `npm i -g gitnexus`

- Use the `analyze` command with the `--skip-agents-md` flag; do not use the `analyze` command without this flag: `npx gitnexus analyze --skip-agents-md`

- Use `npx gitnexus setup` to auto-detects your editors and writes the correct global MCP config. You only need to run it once.
