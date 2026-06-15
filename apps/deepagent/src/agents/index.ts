import { AgentInstructions } from '@call-center-agent/harness';
import { toolRegistry } from '@call-center-agent/harness';
import { toLangChainTools } from '@call-center-agent/harness/langchain';
import { MemorySaver } from '@langchain/langgraph';
import { type DeepAgent, createDeepAgent } from 'deepagents';
import { loadEnv } from '../server/configs/env';
import { providerFactory } from './provider';
import { subAgents } from './subagents';

/**
 * Build the text chatbot deep agent.
 *
 * Uses an in-memory {@link MemorySaver} checkpointer so conversations persist
 * per `thread_id` for the lifetime of the process (lost on restart).
 */
export function createChatAgent(): DeepAgent {
  const { LLM_PROVIDER } = loadEnv();

  const agent = createDeepAgent({
    model: providerFactory.llm(LLM_PROVIDER),
    tools: toLangChainTools(toolRegistry),
    systemPrompt: new AgentInstructions({ mode: 'text' }).build(),
    subagents: subAgents,
    checkpointer: new MemorySaver(),
  });

  return agent as unknown as DeepAgent;
}

export type ChatAgent = DeepAgent;
