import type { ConversationRole } from '@/types/conversation';

export interface ConversationBubbleProps {
  role: ConversationRole;
}

export interface ConversationFeedProps {
  isThinking?: boolean;
}
