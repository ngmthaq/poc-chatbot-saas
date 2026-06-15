import type { ProviderType } from '../agents/provider';

export interface AgentConfig {
  LLM_PROVIDER: ProviderType;
  STT_PROVIDER: ProviderType;
  TTS_PROVIDER: ProviderType;
}
