import { AgentInstructions, toolRegistry } from '@call-center-agent/harness';
import { toLiveKitTools } from '@call-center-agent/harness/livekit';
import { voice } from '@livekit/agents';
import { ProviderType, providerFactory } from './provider';

export class LLMAgent extends voice.Agent {
  constructor() {
    super({
      instructions: new AgentInstructions().build(),
      llm: providerFactory.llm(ProviderType.MISTRAL),
      tools: toLiveKitTools(toolRegistry),
    });
  }
}
