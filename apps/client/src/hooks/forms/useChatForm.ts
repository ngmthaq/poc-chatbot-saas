import { logger } from '@/helpers';
import { useSendChatMessage } from '@/hooks/mutations';
import { useConversation } from '@/hooks/stores';
import { useFormik } from 'formik';
import { useRef } from 'react';
import { type InferType, object, string } from 'yup';

const chatFormSchema = object({
  message: string().trim().min(1).required(),
});

export type ChatFormValues = InferType<typeof chatFormSchema>;

const INITIAL_VALUES: ChatFormValues = {
  message: '',
};

export const useChatForm = () => {
  const { append } = useConversation();
  const { mutate, isPending, error } = useSendChatMessage();
  const threadIdRef = useRef<string | undefined>(undefined);

  const formik = useFormik<ChatFormValues>({
    initialValues: INITIAL_VALUES,
    validationSchema: chatFormSchema,
    onSubmit: (values, helpers) => {
      const message = values.message.trim();
      append({
        id: crypto.randomUUID(),
        role: 'user',
        text: message,
        source: 'text',
        createdAt: Date.now(),
      });
      mutate(
        threadIdRef.current !== undefined
          ? { message, threadId: threadIdRef.current }
          : { message },
        {
          onSuccess: (data) => {
            threadIdRef.current = data.threadId;
            append({
              id: crypto.randomUUID(),
              role: 'agent',
              text: data.reply,
              source: 'text',
              createdAt: Date.now(),
            });
          },
          onError: (err) => {
            logger.error('useChatForm', 'Failed to send chat message', err);
          },
        },
      );
      helpers.resetForm();
    },
  });

  return { formik, isPending, error };
};
