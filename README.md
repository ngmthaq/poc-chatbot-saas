# Call Center Agent

AI-powered call center voice agent built on [LiveKit](https://livekit.io).

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- Docker Engine >= 24 + Docker Compose v2+

## Setup

```bash
# Install dependencies
pnpm install

# Copy environment files
pnpm copy-env
# Then fill in each .env file:
#   apps/server/.env
#   apps/livekit-agent/.env
#   apps/infra/.env
```

## Dev Run

```bash
# 1. Start infrastructure (LiveKit, PostgreSQL, Redis)
pnpm infra dev

# 2. Start the API server
pnpm server dev

# 3. Start the voice agent
pnpm livekit-agent dev
```

## Code Quality

```bash
pnpm format                    # Format all files with Prettier
pnpm server lint       # Lint a specific app
pnpm server typecheck  # Type-check a specific app
```

## Monorepo Structure

```
call-center-agent/
├── apps/
│   ├── livekit-agent/    # LiveKit voice AI agent (TypeScript)
│   ├── client/           # React SPA call UI (TypeScript)
│   ├── server/           # Express.js API server (TypeScript)
│   └── infra/            # Self-hosted Docker Compose stack
└── package.json
```
