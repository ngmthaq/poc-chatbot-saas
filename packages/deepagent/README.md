# deepagent

An in-process text chatbot **library** built with the
[`deepagents`](https://www.npmjs.com/package/deepagents) package and
[LangChain v1](https://js.langchain.com/). It reuses the shared
`@call-center-agent/harness` tools and instructions, wiring them into a deep
agent with `research` and `branch` sub-agents.

It is consumed in-process by `apps/server` (the host owns environment/provider
selection). It is no longer a standalone server.

## Exports

- `ProviderType` — enum of supported LLM providers (`OPENAI`, `MISTRAL`,
  `ANTHROPIC`).
- `createChatAgent(provider: ProviderType): ChatAgent` — builds the underlying
  deep agent for the given provider.
- `TextChatService` — a class holding a single agent instance, exposing
  `chat({ message, threadId? }): Promise<{ threadId; reply }>`.
- Types: `ChatAgent`, `ChatRequestBody`, `ChatResponseBody`.

## Usage

```ts
import { ProviderType, TextChatService } from 'deepagent';

const service = new TextChatService(ProviderType.OPENAI);

const { threadId, reply } = await service.chat({
  message: "What's the weather in Hanoi?",
});

// Continue the same conversation by passing the returned threadId.
const next = await service.chat({ message: 'And tomorrow?', threadId });
```

The host application is responsible for loading environment variables (provider
selection and the relevant `*_API_KEY` for the chosen provider, plus
`TWELVE_DATA_API_KEY` used by the stock-price tool, and optionally
`TAVILY_API_KEY` used by the web-search tool).

## Notes

Conversation threads are kept in memory (`MemorySaver`) and are **lost on
restart**. Pass a stable `threadId` to continue a conversation within a single
process lifetime.
