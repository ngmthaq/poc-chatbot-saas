import { AgentInstructions } from '@call-center-agent/harness';
import { toolRegistry } from '@call-center-agent/harness';
import { toLangChainTools } from '@call-center-agent/harness/langchain';
import { MemorySaver } from '@langchain/langgraph';
import { type DeepAgent, createDeepAgent } from 'deepagents';
import type { ProviderType } from './provider';
import { providerFactory } from './provider';
import { subAgents } from './subagents';

/**
 * Build the text chatbot deep agent.
 *
 * Uses an in-memory {@link MemorySaver} checkpointer so conversations persist
 * per `thread_id` for the lifetime of the process (lost on restart).
 *
 * @param provider - The LLM provider to use. The host owns env/provider
 *   selection; this factory takes the resolved provider explicitly.
 */
export function createChatAgent(provider: ProviderType): DeepAgent {
  const agent = createDeepAgent({
    model: providerFactory.llm(provider),
    tools: toLangChainTools(toolRegistry),
    systemPrompt: new AgentInstructions({ mode: 'text' }).build(),
    subagents: subAgents,
    checkpointer: new MemorySaver(),
  });

  return agent as unknown as DeepAgent;
}

export type ChatAgent = DeepAgent;
