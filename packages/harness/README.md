# @call-center-agent/harness

Framework-agnostic agent harness: LLM **tools** and **instructions** modelled as
plain OOP classes, with thin adapters for [LiveKit Agents](https://docs.livekit.io/agents/)
and [LangChain.js](https://js.langchain.com/) behind separate subpath exports.

The **core** (`.` export) depends only on [`zod`](https://zod.dev/) — it has zero
framework dependencies. Framework coupling lives exclusively in the adapters
reached via the `./livekit` and `./langchain` subpath exports, each backed by an
**optional** peer dependency. A LangChain consumer never pulls in LiveKit, and
vice-versa.

## What's inside

- `BaseTool` — abstract base class: `name`, `description`, a Zod `schema`, and an
  `execute(args): Promise<string>` method.
- Six concrete tools: `getWeather`, `convertCurrency`, `getCoinPrice`,
  `getGoldPrice`, `getStockPrice`, `searchBranchInformation`.
- `toolRegistry` — an array of all tool instances.
- `AgentInstructions` — builds the shared system-instruction string.
- `toLiveKitTools(tools)` — `BaseTool[]` → `Record<string, llm.tool>` (`./livekit`).
- `toLangChainTools(tools)` — `BaseTool[]` → `StructuredTool[]` (`./langchain`).

## Install

This is a private workspace package. Add it to a workspace app via:

```jsonc
{
  "dependencies": {
    "@call-center-agent/harness": "workspace:*",
  },
}
```

For the adapter you use, also install its peer dependency:

- `./livekit` → `@livekit/agents`
- `./langchain` → `langchain` (LangChain JS v1)

## LiveKit usage

```ts
import { AgentInstructions, toolRegistry } from '@call-center-agent/harness';
import { toLiveKitTools } from '@call-center-agent/harness/livekit';
import { voice } from '@livekit/agents';

class LLMAgent extends voice.Agent {
  constructor() {
    super({
      instructions: new AgentInstructions().build(),
      tools: toLiveKitTools(toolRegistry),
      // llm: ...your provider
    });
  }
}
```

## LangChain.js usage

```ts
import { toolRegistry } from '@call-center-agent/harness';
import { toLangChainTools } from '@call-center-agent/harness/langchain';
import { ChatOpenAI } from '@langchain/openai';
import { createAgent } from 'langchain';

const tools = toLangChainTools(toolRegistry);

// Each tool is a LangChain structured tool; invoke one directly:
const weather = tools.find((t) => t.name === 'getWeather')!;
const result = await weather.invoke({ location: 'Hanoi' });
console.log(result);

// Or hand the whole set to an agent:
const agent = createAgent({
  llm: new ChatOpenAI({ model: 'gpt-4o-mini' }),
  tools,
});
```

## Build

```bash
pnpm --filter @call-center-agent/harness build      # tsc → dist/
pnpm --filter @call-center-agent/harness typecheck
pnpm --filter @call-center-agent/harness test
```
