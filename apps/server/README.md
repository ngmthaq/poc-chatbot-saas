# server

Express.js + TypeScript API server for the call center agent.

## Prerequisites

- Node.js >= 22
- pnpm >= 10

## Setup

```bash
# From the repo root — install all workspace dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env
```

### Environment Variables

| Key        | Default       | Description                   |
| ---------- | ------------- | ----------------------------- |
| `PORT`     | `3000`        | HTTP port the server binds to |
| `NODE_ENV` | `development` | Runtime mode                  |

## Dev Run

```bash
# From the repo root
pnpm server dev

# Or from this directory
pnpm dev
```
