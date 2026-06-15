import type { ChatMode } from '@/types/conversation';
import { atom, useAtom } from 'jotai';

export const modeAtom = atom<ChatMode>('text');

export const useChatMode = (): [ChatMode, (mode: ChatMode) => void] => {
  const [mode, setMode] = useAtom(modeAtom);
  return [mode, setMode];
};
