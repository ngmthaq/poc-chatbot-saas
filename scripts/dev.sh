#!/usr/bin/env bash
#
# Dev launcher that builds workspace library dependencies (in order) before
# starting a package's watcher. Libraries are consumed via their built `dist`,
# so they must exist first; deepagent's type build also needs harness's dist,
# hence harness is always built before deepagent.
#
# Usage: bash scripts/dev.sh <deepagent|server>

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

build_lib() {
  echo "› building $1"
  pnpm --filter "$1" run build
}

case "${1:-}" in
  deepagent)
    build_lib @call-center-agent/harness
    cd "$ROOT/packages/deepagent"
    exec pnpm exec tsup --watch
    ;;
  server)
    build_lib @call-center-agent/harness
    build_lib @call-center-agent/deepagent
    cd "$ROOT/apps/server"
    exec pnpm exec tsx watch src/server.ts
    ;;
  *)
    echo "usage: bash scripts/dev.sh <deepagent|server>" >&2
    exit 1
    ;;
esac
