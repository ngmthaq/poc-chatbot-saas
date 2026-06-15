import { AgentInstructions, toolRegistry } from '@call-center-agent/harness';
import { toLiveKitTools } from '@call-center-agent/harness/livekit';
import { voice } from '@livekit/agents';
import { loadEnv } from '../configs/env';
import { providerFactory } from './provider';

export class LLMAgent extends voice.Agent {
  constructor() {
    super({
      instructions: new AgentInstructions().build(),
      llm: providerFactory.llm(loadEnv().LLM_PROVIDER),
      tools: toLiveKitTools(toolRegistry),
    });
  }
}
