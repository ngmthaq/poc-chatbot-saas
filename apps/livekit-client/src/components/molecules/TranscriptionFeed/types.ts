import type { TextStreamData } from '@livekit/components-react';

export interface TranscriptionFeedProps {
  transcriptions: TextStreamData[];
}

export interface TranscriptionEntryProps {
  isLatest: boolean;
}
