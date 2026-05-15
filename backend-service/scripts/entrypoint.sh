#!/usr/bin/env sh
#
# entrypoint.sh — Run Prisma migrations BEFORE handing control to the Node
# process. Ordering matters: if the schema is unreachable we want the
# container to crash early (and `restart: unless-stopped` to retry) rather
# than have the API bind a port and serve 500s against a stale schema.
#
# Operators running blue/green or multi-replica deployments should run
# `prisma migrate deploy` once from CI (not from every replica) and set
# `RUN_MIGRATIONS=0` to opt this step out — that avoids race conditions
# where N replicas race to acquire the migrations advisory lock.
#
# Alpine ships POSIX `sh` (busybox), not `bash`. `set -eu` is portable;
# `pipefail` is not, so we omit it deliberately.

set -eu

# RUN_MIGRATIONS defaults to "1" (run) when unset. Any other value than "0"
# is treated as "run" to make the flag easy to reason about.
if [ "${RUN_MIGRATIONS:-1}" != "0" ]; then
  # `migrate deploy` is a no-op when the migrations table matches; but it
  # errors out if the `prisma/migrations` directory is entirely missing.
  # Guard so a fresh project (no migrations yet) does not crash-loop.
  if [ -d /app/prisma/migrations ]; then
    echo "[entrypoint] applying Prisma migrations"
    npx --no-install prisma migrate deploy
  else
    echo "[entrypoint] skipping migrations: /app/prisma/migrations not present"
  fi
else
  echo "[entrypoint] RUN_MIGRATIONS=0 — skipping prisma migrate deploy"
fi

# `exec` replaces this shell with the CMD process so signals reach Node
# directly (tini then forwards SIGTERM/SIGINT to it for clean shutdowns).
exec "$@"
