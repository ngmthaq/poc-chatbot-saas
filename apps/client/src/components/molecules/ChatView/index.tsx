import { ChatPanel } from '@/components/molecules/ChatPanel';
import { ConversationFeed } from '@/components/molecules/ConversationFeed';
import { useChatForm } from '@/hooks/forms';
import { useConversation } from '@/hooks/stores';
import { type FC, useEffect, useRef } from 'react';
import { ChatViewRoot, InputDock } from './styled';

const GREETING_TEXT = 'Hello! How can I help you today?';

export const ChatView: FC = () => {
  const { formik, isPending, error } = useChatForm();
  const { entries, append } = useConversation();
  const hasSeededGreetingRef = useRef(false);

  useEffect(() => {
    if (hasSeededGreetingRef.current || entries.length > 0) {
      return;
    }
    hasSeededGreetingRef.current = true;
    append({
      id: crypto.randomUUID(),
      role: 'agent',
      text: GREETING_TEXT,
      source: 'text',
      createdAt: Date.now(),
    });
  }, [entries, append]);

  return (
    <ChatViewRoot>
      <ConversationFeed isThinking={isPending} />
      <InputDock>
        <ChatPanel formik={formik} isPending={isPending} error={error} />
      </InputDock>
    </ChatViewRoot>
  );
};
