import { MarkdownMessage } from '@/components/atoms';
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
  ThinkingBubble,
  ThinkingDot,
} from './styled';
import type { ConversationFeedProps } from './types';

export const ConversationFeed: FC<ConversationFeedProps> = ({
  isThinking = false,
}) => {
  const { entries } = useConversation();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries, isThinking]);

  if (entries.length === 0 && !isThinking) {
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
          <Bubble role={entry.role}>
            {entry.role === 'agent' ? (
              <MarkdownMessage>{entry.text}</MarkdownMessage>
            ) : (
              entry.text
            )}
          </Bubble>
          <SourceTag variant="caption">{entry.source}</SourceTag>
        </BubbleRow>
      ))}
      {isThinking && (
        <ThinkingBubble aria-label="agent is thinking">
          <ThinkingDot />
          <ThinkingDot />
          <ThinkingDot />
        </ThinkingBubble>
      )}
      <div ref={bottomRef} />
    </FeedContainer>
  );
};
