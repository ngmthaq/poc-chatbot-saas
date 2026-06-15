import { type BaseMessage, HumanMessage } from '@langchain/core/messages';
import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { ChatAgent } from '../../agents';
import type { ChatResponseBody } from '../../types/chat';

const bodySchema = z.object({
  message: z.string().trim().min(1, 'message is required'),
  threadId: z.string().trim().min(1).optional(),
});

export class ChatController {
  public constructor(private readonly agent: ChatAgent) {}

  public readonly handleChat: RequestHandler = async (req, res, next) => {
    try {
      const parsed = bodySchema.safeParse(req.body);
      if (!parsed.success) {
        const message = parsed.error.issues
          .map((issue) => issue.message)
          .join(', ');
        throw createHttpError(400, message);
      }

      const { message } = parsed.data;
      const threadId = parsed.data.threadId ?? randomUUID();

      const result = await this.agent.invoke(
        { messages: [new HumanMessage(message)] },
        { configurable: { thread_id: threadId } },
      );

      const reply = extractReply(result.messages);
      const body: ChatResponseBody = { threadId, reply };
      res.status(200).json(body);
    } catch (err) {
      next(err);
    }
  };
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
