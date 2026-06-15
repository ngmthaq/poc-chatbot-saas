import { TextChatService } from '@call-center-agent/deepagent';
import { loadEnv } from '../configs';
import type { ChatResponseBody } from '../types/chat';
import type { ChatBody } from '../validators/chat.validator';

export class ChatService {
  private readonly textChatService = new TextChatService(
    loadEnv().LLM_PROVIDER,
  );

  public async chat(body: ChatBody): Promise<ChatResponseBody> {
    return this.textChatService.chat({
      message: body.message,
      ...(body.threadId !== undefined ? { threadId: body.threadId } : {}),
    });
  }
}
