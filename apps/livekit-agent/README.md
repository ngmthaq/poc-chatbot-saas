# livekit-agent

LiveKit voice AI agent (TypeScript).

## Prerequisites

- Node.js >= 22
- pnpm >= 10
- HuggingFace CLI (optional, for downloading model files)

## Setup

```bash
# From the repo root — install all workspace dependencies
pnpm install

# Copy and fill in environment variables
cp .env.example .env

# (Optional) Download model files
pnpm livekit-agent download-files
```

## Dev Run

```bash
# From the repo root
pnpm livekit-agent dev

# Or from this directory
pnpm dev
```
