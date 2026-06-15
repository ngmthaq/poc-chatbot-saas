import type { ProviderType } from '../agents/provider';

export interface AppConfig {
  PORT: number;
  NODE_ENV: string;
  LLM_PROVIDER: ProviderType;
}

export interface ChatRequestBody {
  message: string;
  threadId?: string;
}

export interface ChatResponseBody {
  threadId: string;
  reply: string;
}

export interface ErrorResponseBody {
  status: number;
  message: string;
}
