import { ChatPanel } from '@/components/molecules/ChatPanel';
import { ConversationFeed } from '@/components/molecules/ConversationFeed';
import type { FC } from 'react';
import { ChatViewRoot, InputDock } from './styled';

export const ChatView: FC = () => (
  <ChatViewRoot>
    <ConversationFeed />
    <InputDock>
      <ChatPanel />
    </InputDock>
  </ChatViewRoot>
);
