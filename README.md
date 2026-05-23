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
#   apps/livekit-server/.env
#   apps/livekit-agent/.env
#   apps/livekit-infra/.env
```

## Dev Run

```bash
# 1. Start infrastructure (LiveKit, PostgreSQL, Redis)
pnpm livekit-infra dev

# 2. Start the API server
pnpm livekit-server dev

# 3. Start the voice agent
pnpm livekit-agent dev
```

## Code Quality

```bash
pnpm format                    # Format all files with Prettier
pnpm livekit-server lint       # Lint a specific app
pnpm livekit-server typecheck  # Type-check a specific app
```

## Monorepo Structure

```
call-center-agent/
├── apps/
│   ├── livekit-agent/    # LiveKit voice AI agent (TypeScript)
│   ├── livekit-server/   # Express.js API server (TypeScript)
│   └── livekit-infra/    # Self-hosted Docker Compose stack
└── package.json
```
