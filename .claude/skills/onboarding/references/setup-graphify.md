# Graphify Setup

Graphify transforms a repository — code, SQL schemas, docs, PDFs, images — into a queryable knowledge graph that AI agents can consult so they never miss code context. See [graphify on GitHub](https://github.com/safishamsi/graphify).

## Prerequisites

- Python 3.10+
- `uv` (recommended) or `pipx`

## Install

The PyPI package is `graphifyy` (double-y); the CLI command is `graphify`.

```bash
# Recommended
uv tool install graphifyy

# Alternatives
pipx install graphifyy
pip install graphifyy
```

Optional extractors (install only what the project needs):

```bash
uv tool install "graphifyy[sql]"     # SQL schema extraction
uv tool install "graphifyy[pdf]"     # PDF extraction
uv tool install "graphifyy[office]"  # .docx / .xlsx
uv tool install "graphifyy[all]"     # everything
```

## Register with Claude Code

Register Graphify as a skill, scoped to the current project:

```bash
graphify install --project
```

Run once. After this, the assistant can consult the graph automatically.

## Build the graph

```bash
graphify .                 # build graph for the current folder
graphify . --update        # re-extract only changed files
graphify . --no-viz        # skip HTML, output report + JSON only
```

This produces `graphify-out/` (`graph.html`, `GRAPH_REPORT.md`, `graph.json`). Commit `graphify-out/` so the whole team starts from the same map.

Headless extraction of docs/PDFs/images needs an LLM backend key — set `ANTHROPIC_API_KEY` (Claude) in the environment before building. Code files are parsed locally and never sent to an API.

## Query the graph

```bash
graphify query "what connects auth to the database?"
graphify path "UserService" "DatabasePool"
graphify explain "RateLimiter"
```

## Keep it fresh (optional)

```bash
graphify hook install      # auto-rebuild on commit
```
