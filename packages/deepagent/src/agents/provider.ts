import { ChatAnthropic } from '@langchain/anthropic';
import type { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { ChatMistralAI } from '@langchain/mistralai';
import { ChatOpenAI } from '@langchain/openai';

export enum ProviderType {
  OPENAI = 'OPENAI',
  MISTRAL = 'MISTRAL',
  ANTHROPIC = 'ANTHROPIC',
}

const LLM_REGISTRY = {
  [ProviderType.OPENAI]: () => {
    return new ChatOpenAI({ model: 'gpt-4o-mini' });
  },

  [ProviderType.MISTRAL]: () => {
    return new ChatMistralAI({ model: 'mistral-small-latest' });
  },

  [ProviderType.ANTHROPIC]: () => {
    return new ChatAnthropic({ model: 'claude-3-5-haiku-latest' });
  },
} satisfies Record<ProviderType, () => BaseChatModel>;

function llmFactory(type: ProviderType): BaseChatModel {
  const factory = LLM_REGISTRY[type];
  if (factory === undefined) {
    throw new Error(`Unsupported provider type: ${type}`);
  }
  return factory();
}

export const providerFactory = {
  llm: llmFactory,
};
