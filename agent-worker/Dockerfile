# syntax=docker/dockerfile:1.7
#
# Multi-stage build for the LiveKit Agents worker.
#
#   builder    — full dev deps + `yarn build` (tsc → dist/).
#   deps-prod  — clean prod-only `node_modules` (no devDependencies, no build
#                tooling). Kept separate so the runner stage never sees the
#                builder's bloated tree.
#   runner     — tini PID 1, non-root `node` user, copies only what runtime
#                actually needs (compiled `dist/`, prod modules).
#
# Pinned base image: `node:20-bookworm-slim` (Debian glibc, 20.x LTS).
# `@livekit/rtc-ffi-bindings` publishes only glibc (`*-gnu`) prebuilt native
# bindings — no musl variant — so Alpine causes a runtime
# `MODULE_NOT_FOUND` for `./rtc-node.linux-<arch>-musl.node` at startup.
# bookworm-slim still ships the non-root `node` user (uid 1000) used below.
# `:latest` is intentionally forbidden for reproducible builds.
#
# Unlike backend-service this worker has NO Prisma and NO HTTP server, so no
# `EXPOSE`: it connects OUTBOUND to `LIVEKIT_URL` and never binds a host
# port. tini is installed via apt for clean PID-1 SIGTERM forwarding to the
# Node process so LiveKit worker drain works on `docker compose down`.

ARG NODE_IMAGE=node:20-bookworm-slim

# ---------------------------------------------------------------------------
# Stage 1 — builder
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS builder

WORKDIR /app

# Copy only the manifests first so dependency installs cache on lockfile
# changes alone (source edits don't bust this layer).
COPY package.json yarn.lock ./

# `--frozen-lockfile` aborts if `yarn.lock` would drift — required for
# reproducible builds.
RUN yarn install --frozen-lockfile

# Bring the rest of the source in and build.
COPY . .
RUN yarn build

# ---------------------------------------------------------------------------
# Stage 2 — deps-prod
# ---------------------------------------------------------------------------
# A clean install of production dependencies only. Used by the runner stage
# so that devDependencies (jest, ts-node, eslint, ...) never reach the image.
FROM ${NODE_IMAGE} AS deps-prod
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --production --frozen-lockfile \
    && yarn cache clean

# ---------------------------------------------------------------------------
# Stage 3 — runner
# ---------------------------------------------------------------------------
FROM ${NODE_IMAGE} AS runner

# tini is PID 1 so the process tree reaps zombies and forwards SIGTERM to the
# Node process cleanly — required for a clean LiveKit worker drain on
# `docker compose down`.
RUN apt-get update && apt-get install -y --no-install-recommends tini && rm -rf /var/lib/apt/lists/*
ENV NODE_ENV=production
WORKDIR /app

# Copy production-only modules from deps-prod.
COPY --from=deps-prod /app/node_modules ./node_modules

# Compiled application bundle.
COPY --from=builder /app/dist ./dist

# package.json is required by `node` (resolves `"type"`, `"main"`, etc.).
COPY --from=builder /app/package.json ./package.json

# Entrypoint script — copied last so changes to it don't bust earlier layers.
COPY scripts/entrypoint.sh /app/scripts/entrypoint.sh

# `node` is the pre-existing non-root user (uid 1000) in the official Node
# bookworm-slim image. Ownership flip keeps runtime files non-root.
RUN chmod +x /app/scripts/entrypoint.sh \
    && chown -R node:node /app

USER node

# No EXPOSE — the worker opens an OUTBOUND WebSocket to LIVEKIT_URL and
# never listens on a host port.

ENTRYPOINT ["/usr/bin/tini", "--", "/app/scripts/entrypoint.sh"]
CMD ["node", "dist/main.js", "start"]
