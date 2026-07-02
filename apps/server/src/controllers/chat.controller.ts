import type { RequestHandler } from 'express';
import { chatService } from '../services';
import type { ChatBody } from '../validators';

export class ChatController {
  public readonly handleChat: RequestHandler = async (req, res) => {
    const { threadId, reply } = await chatService.chat(req.body as ChatBody);
    // Send the response directly so it preserves the deepagent contract shape
    // `{ threadId, reply }`. responseHandler short-circuits when headers are
    // already sent, so it will not wrap this payload.
    res.status(200).json({ threadId, reply });
  };
}

export const chatController = new ChatController();
