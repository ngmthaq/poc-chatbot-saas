export interface ChatRequestBody {
  message: string;
  threadId?: string;
}

export interface ChatResponseBody {
  threadId: string;
  reply: string;
}
