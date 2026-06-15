# deepagent

A standalone Express text chatbot built with the
[`deepagents`](https://www.npmjs.com/package/deepagents) package and
[LangChain v1](https://js.langchain.com/). It reuses the shared
`@call-center-agent/harness` tools and instructions, wiring them into a deep
agent with `research` and `branch` sub-agents.

## Run

```bash
pnpm copy-env          # creates apps/deepagent/.env.local from .env.example
pnpm deepagent dev     # builds, then starts the server
```

## API

### `POST /chat`

Request body:

```jsonc
{
  "message": "What's the weather in Hanoi?",
  "threadId": "optional-existing-thread", // omit to start a new conversation
}
```

Response:

```jsonc
{
  "threadId": "f1e2d3c4-...",
  "reply": "...",
}
```

Example:

```bash
curl -X POST http://localhost:3100/chat \
  -H 'Content-Type: application/json' \
  -d '{"message":"What is the price of gold today?"}'
```

### `GET /health`

Returns `200` with `{ "status": "ok" }`.

## Configuration

Set in `apps/deepagent/.env.local`:

- `PORT` — HTTP port (default `3100`).
- `LLM_PROVIDER` — one of `OPENAI`, `MISTRAL`, `ANTHROPIC` (default `OPENAI`).
- `OPENAI_API_KEY` / `MISTRAL_API_KEY` / `ANTHROPIC_API_KEY` — the key for the
  selected provider.
- `TWELVE_DATA_API_KEY` — used by the stock-price tool.

## Notes

Conversation threads are kept in memory (`MemorySaver`) and are **lost on
restart**. Pass a stable `threadId` to continue a conversation within a single
process lifetime.
