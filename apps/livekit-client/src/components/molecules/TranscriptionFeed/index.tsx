import { type FC, useEffect, useRef } from 'react';
import {
  EmptyState,
  FeedContainer,
  PlaceholderIcon,
  PlaceholderText,
  TranscriptionEntry,
} from './styled';
import type { TranscriptionFeedProps } from './types';

export const TranscriptionFeed: FC<TranscriptionFeedProps> = ({
  transcriptions,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [transcriptions]);

  if (transcriptions.length === 0) {
    return (
      <EmptyState>
        <PlaceholderIcon />
        <PlaceholderText variant="caption">
          Transcription will appear here…
        </PlaceholderText>
      </EmptyState>
    );
  }

  return (
    <FeedContainer>
      {transcriptions.map((entry, index) => (
        <TranscriptionEntry
          key={index}
          variant="body2"
          isLatest={index === transcriptions.length - 1}
        >
          {entry.text}
        </TranscriptionEntry>
      ))}
      <div ref={bottomRef} />
    </FeedContainer>
  );
};
