import * as yup from 'yup';
import type { InferType } from 'yup';

export const chatSchema = yup.object({
  message: yup.string().trim().min(1).required('message is required'),
  threadId: yup.string().trim().optional(),
  botId: yup.string().trim().optional(),
});

export type ChatBody = InferType<typeof chatSchema>;
