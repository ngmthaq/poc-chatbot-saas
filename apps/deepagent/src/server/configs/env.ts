import dotenv from 'dotenv';
import { z } from 'zod';
import { ProviderType } from '../../agents/provider';
import type { AppConfig } from '../../types/chat';

dotenv.config({ path: '.env.local' });

const schema = z.object({
  PORT: z.coerce.number().int().positive().default(3100),
  NODE_ENV: z.string().default('development'),
  LLM_PROVIDER: z.nativeEnum(ProviderType).default(ProviderType.OPENAI),
});

let config: AppConfig | undefined;

function loadEnv(): AppConfig {
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
