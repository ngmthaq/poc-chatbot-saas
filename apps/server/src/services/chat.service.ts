import { TextChatService } from '@call-center-agent/deepagent';
import createHttpError from 'http-errors';
import { loadEnv } from '../configs';
import type { ChatResponseBody } from '../types/chat';
import type { ChatBody } from '../validators/chat.validator';

export class ChatService {
  // Hard ceiling for a single chat request. Larger than the 8s tool-fetch
  // timeout so per-provider fallbacks fire before this 504 does.
  private readonly chatTimeoutMs = 30_000;

  private readonly textChatService = new TextChatService(
    loadEnv().LLM_PROVIDER,
  );

  public async chat(body: ChatBody): Promise<ChatResponseBody> {
    let timeout: ReturnType<typeof setTimeout> | undefined;
    const timeoutPromise = new Promise<never>((_resolve, reject) => {
      timeout = setTimeout(() => {
        reject(createHttpError(504, 'Chat request timed out'));
      }, this.chatTimeoutMs);
    });

    try {
      return await Promise.race([
        this.textChatService.chat({
          message: body.message,
          ...(body.threadId !== undefined ? { threadId: body.threadId } : {}),
        }),
        timeoutPromise,
      ]);
    } finally {
      clearTimeout(timeout);
    }
  }
}
