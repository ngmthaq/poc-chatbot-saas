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

> The `deepagent` library and its `@call-center-agent/harness` dependency must
> be built (`pnpm --filter deepagent build`) before running or type-checking the
> server — the server resolves `deepagent` via its `dist` exports.

### Environment Variables

| Key                   | Default       | Description                                              |
| --------------------- | ------------- | -------------------------------------------------------- |
| `PORT`                | `3000`        | HTTP port the server binds to                            |
| `NODE_ENV`            | `development` | Runtime mode                                             |
| `LLM_PROVIDER`        | `OPENAI`      | deepagent LLM provider: `OPENAI`, `MISTRAL`, `ANTHROPIC` |
| `OPENAI_API_KEY`      | —             | OpenAI API key (read by LangChain from `process.env`)    |
| `MISTRAL_API_KEY`     | —             | Mistral API key                                          |
| `ANTHROPIC_API_KEY`   | —             | Anthropic API key                                        |
| `TWELVE_DATA_API_KEY` | —             | Twelve Data API key for agent data tools                 |

## Endpoints

### `POST /chat`

Text chat backed by the `deepagent` library.

Request body:

```json
{ "message": "hi", "threadId": "optional-existing-thread" }
```

Response `200`:

```json
{ "threadId": "uuid", "reply": "..." }
```

`message` is required (trimmed, min length 1); an empty/missing `message` is
rejected with `422` before reaching the service. Omit `threadId` to start a new
conversation; pass an existing one to continue it within the process lifetime.

## Dev Run

```bash
# From the repo root
pnpm server dev

# Or from this directory
pnpm dev
```
