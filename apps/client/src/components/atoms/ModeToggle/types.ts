import type { ChatMode } from '@/types/conversation';
import type { ComponentType } from 'react';

export interface ModeOption {
  value: ChatMode;
  label: string;
  Icon: ComponentType;
}
