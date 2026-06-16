import { apiEndpoints, axiosInstance } from '@/configs';
import { useMutation } from '@tanstack/react-query';
import { object, string } from 'yup';

export interface SendChatMessagePayload {
  message: string;
  threadId?: string;
}

const sendChatMessageResponseSchema = object({
  threadId: string().required(),
  reply: string().required(),
});

export const useSendChatMessage = () => {
  return useMutation({
    mutationFn: async (payload: SendChatMessagePayload) => {
      const response = await axiosInstance.post(
        apiEndpoints.post.chat(),
        payload,
      );

      return sendChatMessageResponseSchema.validateSync(response.data, {
        stripUnknown: true,
      });
    },
  });
};
