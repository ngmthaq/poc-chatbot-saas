import type { RequestHandler } from 'express';
import { ChatService } from '../services/chat.service';
import type { ChatBody } from '../validators/chat.validator';

export class ChatController {
  private readonly chatService = new ChatService();

  public readonly handleChat: RequestHandler = async (req, res) => {
    const { threadId, reply } = await this.chatService.chat(
      req.body as ChatBody,
    );
    // Send the response directly so it preserves the deepagent contract shape
    // `{ threadId, reply }`. responseHandler short-circuits when headers are
    // already sent, so it will not wrap this payload.
    res.status(200).json({ threadId, reply });
  };
}
