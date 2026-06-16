import type { useChatForm } from '@/hooks/forms';

type ChatForm = ReturnType<typeof useChatForm>;

export interface ChatPanelProps {
  formik: ChatForm['formik'];
  isPending: ChatForm['isPending'];
  error: ChatForm['error'];
}
