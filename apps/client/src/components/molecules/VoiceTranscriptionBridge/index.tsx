import { useConversation } from '@/hooks/stores';
import {
  useLocalParticipant,
  useTranscriptions,
} from '@livekit/components-react';
import { type FC, useEffect, useRef } from 'react';

const FINAL_ATTRIBUTE = 'lk.transcription_final';

const isFinalized = (value: string | undefined): boolean =>
  value === 'true' || value === '1';

export const VoiceTranscriptionBridge: FC = () => {
  const transcriptions = useTranscriptions();
  const { localParticipant } = useLocalParticipant();
  const { append } = useConversation();
  const appendedIdsRef = useRef<Set<string>>(new Set());

  const localIdentity = localParticipant.identity;

  useEffect(() => {
    for (const segment of transcriptions) {
      const { id, attributes } = segment.streamInfo;

      if (appendedIdsRef.current.has(id)) {
        continue;
      }

      if (!isFinalized(attributes?.[FINAL_ATTRIBUTE])) {
        continue;
      }

      const text = segment.text.trim();
      if (text.length === 0) {
        appendedIdsRef.current.add(id);
        continue;
      }

      appendedIdsRef.current.add(id);
      append({
        id,
        role:
          segment.participantInfo.identity === localIdentity ? 'user' : 'agent',
        text,
        source: 'voice',
        createdAt: Date.now(),
      });
    }
  }, [transcriptions, localIdentity, append]);

  return null;
};
