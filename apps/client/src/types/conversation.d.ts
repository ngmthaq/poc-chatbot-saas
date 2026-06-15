export type ChatMode = 'text' | 'voice';

export type ConversationRole = 'user' | 'agent';

export type ConversationSource = 'text' | 'voice';

export interface ConversationEntry {
  id: string;
  role: ConversationRole;
  text: string;
  source: ConversationSource;
  createdAt: number;
}
