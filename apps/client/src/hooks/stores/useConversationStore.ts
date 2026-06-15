import type { ConversationEntry } from '@/types/conversation';
import { atom, useAtom } from 'jotai';
import { useCallback } from 'react';

export const conversationAtom = atom<ConversationEntry[]>([]);

export const useConversation = () => {
  const [entries, setEntries] = useAtom(conversationAtom);

  const append = useCallback(
    (entry: ConversationEntry) => {
      setEntries((current) => [...current, entry]);
    },
    [setEntries],
  );

  const reset = useCallback(() => {
    setEntries([]);
  }, [setEntries]);

  return { entries, append, reset };
};
