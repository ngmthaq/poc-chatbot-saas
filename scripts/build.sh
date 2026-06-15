#!/usr/bin/env bash
#
# Sequential production build of all workspace packages, in dependency order:
#   harness -> deepagent -> livekit-agent -> server -> client
#
# Libraries (harness, deepagent) are consumed via their built `dist`, so they
# must be built before the packages that depend on them.
#
# infra is intentionally excluded — build/run it separately via `pnpm infra …`.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

build() {
  echo "› building $1"
  pnpm --filter "$1" run build
}

build @call-center-agent/harness
build @call-center-agent/deepagent
build livekit-agent
build server
build client
