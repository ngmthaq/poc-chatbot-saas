import { useConversation } from '@/hooks/stores';
import { type FC, useEffect, useRef } from 'react';
import {
  Bubble,
  BubbleRow,
  EmptyState,
  FeedContainer,
  PlaceholderIcon,
  PlaceholderText,
  SourceTag,
} from './styled';

export const ConversationFeed: FC = () => {
  const { entries } = useConversation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries]);

  if (entries.length === 0) {
    return (
      <EmptyState>
        <PlaceholderIcon />
        <PlaceholderText variant="caption">
          Your conversation will appear here…
        </PlaceholderText>
      </EmptyState>
    );
  }

  return (
    <FeedContainer>
      {entries.map((entry) => (
        <BubbleRow key={entry.id} role={entry.role}>
          <Bubble role={entry.role}>{entry.text}</Bubble>
          <SourceTag variant="caption">{entry.source}</SourceTag>
        </BubbleRow>
      ))}
      <div ref={bottomRef} />
    </FeedContainer>
  );
};
