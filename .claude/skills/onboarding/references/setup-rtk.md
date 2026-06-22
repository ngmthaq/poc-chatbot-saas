# RTK Setup

RTK is a CLI proxy that reduces LLM token consumption by 60–90% on development commands. It is a single Rust binary that filters and compresses command output before it reaches the assistant's context window. See [rtk on GitHub](https://github.com/rtk-ai/rtk/tree/develop).

## Install

```bash
# Homebrew (recommended)
brew install rtk

# Quick install script (Linux/macOS)
curl -fsSL https://raw.githubusercontent.com/rtk-ai/rtk/refs/heads/master/install.sh | sh

# Cargo
cargo install --git https://github.com/rtk-ai/rtk
```

If installed via the script, ensure `~/.local/bin` is on `PATH`. Verify:

```bash
rtk --version
```

## Register with Claude Code

```bash
rtk init -g          # Claude Code / Copilot (default), global
rtk init -g --auto-patch   # non-interactive, for CI/CD
```

Restart Claude Code afterward to enable the auto-rewrite hook. The hook intercepts Bash commands and transparently rewrites them to their RTK equivalents (e.g. `git status` → `rtk git status`). Claude Code's built-in `Read`, `Grep`, and `Glob` tools bypass the hook — use shell commands or explicit `rtk` invocations to get the savings for those.

## Common commands

```bash
rtk git status / log / diff   # compact git
rtk ls .                      # token-optimized directory tree
rtk grep "pattern" .          # grouped search results
rtk cargo test / pytest / jest / go test   # tests, failures-focused
rtk tsc / lint / ruff check   # build and lint, grouped
```

## Verify savings

```bash
rtk gain            # token savings summary
rtk gain --graph    # ASCII graph over 30 days
rtk discover        # find missed savings opportunities
```

## Notes

- Config lives at `~/.config/rtk/config.toml` (macOS: `~/Library/Application Support/rtk/config.toml`).
- Telemetry is disabled by default; opt in with `rtk telemetry enable`.
- On Windows, use WSL for full functionality including the auto-rewrite hook.
