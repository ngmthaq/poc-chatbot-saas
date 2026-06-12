# infra

Docker Compose stack for LiveKit infrastructure (LiveKit server, Redis, PostgreSQL).

## Prerequisites

- Docker Engine >= 24
- Docker Compose v2+

## Setup

```bash
# Copy and fill in environment variables
cp .env.example .env
```

## Dev Run

```bash
# From the repo root
pnpm infra dev

# Or from this directory
docker compose --profile dev up -d
```

Stop the dev stack:

```bash
docker compose --profile dev down
```

### Dev Service Ports

| Service    | Address               |
| ---------- | --------------------- |
| LiveKit    | `ws://localhost:7880` |
| PostgreSQL | `localhost:5432`      |
| Redis      | `localhost:6379`      |

Dev API key: `devkey` / secret: `devsecret`

## Production

> Production requires a Linux host, two DNS A records, and TLS certificates via Certbot. See the setup steps below.

```bash
# Start prod stack
docker compose --profile prod up -d

# Stop prod stack
docker compose --profile prod down
```
