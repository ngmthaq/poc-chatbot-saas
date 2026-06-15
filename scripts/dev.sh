#!/usr/bin/env bash
#
# Dev launcher for the full stack, in dependency order:
#   harness -> deepagent -> livekit-agent -> server -> client
#
# Libraries (harness, deepagent) are consumed via their built `dist`, so they
# are built once up front before any watcher starts. Then each package's own
# `dev` watcher runs concurrently. infra is excluded — run it via `pnpm infra …`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

build_lib() {
  echo "› building $1"
  pnpm --filter "$1" run build
}

# Build libraries once, in order, so the app watchers have a dist to import.
build_lib @call-center-agent/harness
build_lib @call-center-agent/deepagent

# Start every package's own dev watcher concurrently; tear them down together.
pids=()
cleanup() { kill "${pids[@]}" 2>/dev/null || true; }
trap cleanup EXIT INT TERM

pnpm --filter @call-center-agent/harness run dev & pids+=($!)
pnpm --filter @call-center-agent/deepagent run dev & pids+=($!)
pnpm --filter livekit-agent run dev & pids+=($!)
pnpm --filter server run dev & pids+=($!)
pnpm --filter client run dev & pids+=($!)

wait
