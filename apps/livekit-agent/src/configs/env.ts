import dotenv from 'dotenv';
import { z } from 'zod';
import { ProviderType } from '../agents/provider';
import type { AgentConfig } from '../types/agent-config';

dotenv.config({ path: '.env.local' });

const schema = z.object({
  LLM_PROVIDER: z.nativeEnum(ProviderType).default(ProviderType.MISTRAL),
  STT_PROVIDER: z.nativeEnum(ProviderType).default(ProviderType.MISTRAL),
  TTS_PROVIDER: z.nativeEnum(ProviderType).default(ProviderType.MISTRAL),
});

let config: AgentConfig | undefined;

function loadEnv(): AgentConfig {
  if (config === undefined) {
    const result = schema.safeParse(process.env);
    if (!result.success) {
      const message = result.error.issues
        .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
        .join(', ');
      throw new Error(`Invalid environment configuration: ${message}`);
    }
    config = result.data;
  }

  return config;
}

export { loadEnv };
