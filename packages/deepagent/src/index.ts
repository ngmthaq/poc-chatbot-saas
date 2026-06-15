import { type BaseMessage, HumanMessage } from '@langchain/core/messages';
import { randomUUID } from 'node:crypto';
import { type ChatAgent, createChatAgent } from './agents';
import { ProviderType } from './agents/provider';
import type { ChatRequestBody, ChatResponseBody } from './types/chat';

export { createChatAgent } from './agents';
export type { ChatAgent } from './agents';
export { ProviderType } from './agents/provider';
export type { ChatRequestBody, ChatResponseBody } from './types/chat';

/**
 * In-process text chat service backed by a `deepagents` deep agent.
 *
 * Holds a single agent instance built from the provided {@link ProviderType}.
 * Conversation state is kept in memory (via the agent's `MemorySaver`) and is
 * lost on restart; pass a stable `threadId` to continue a conversation within
 * a single process lifetime.
 */
export class TextChatService {
  private readonly agent: ChatAgent;

  public constructor(provider: ProviderType) {
    this.agent = createChatAgent(provider);
  }

  /**
   * Send a message to the deep agent and return its reply.
   *
   * @param request - The message and optional existing `threadId`. When no
   *   `threadId` is supplied a new one is generated.
   * @returns The (possibly newly generated) `threadId` and the agent's reply.
   */
  public async chat(request: ChatRequestBody): Promise<ChatResponseBody> {
    const threadId = request.threadId ?? randomUUID();

    const result = await this.agent.invoke(
      { messages: [new HumanMessage(request.message)] },
      { configurable: { thread_id: threadId } },
    );

    const reply = extractReply(result.messages);
    return { threadId, reply };
  }
}

function extractReply(messages: BaseMessage[]): string {
  for (let index = messages.length - 1; index >= 0; index -= 1) {
    const message = messages[index];
    if (message?.getType() === 'ai') {
      return contentToText(message.content);
    }
  }
  return '';
}

function contentToText(content: BaseMessage['content']): string {
  if (typeof content === 'string') {
    return content;
  }
  return content
    .map((part) => (typeof part === 'string' ? part : textOfPart(part)))
    .join('');
}

function textOfPart(part: Record<string, unknown>): string {
  return part['type'] === 'text' && typeof part['text'] === 'string'
    ? part['text']
    : '';
}
