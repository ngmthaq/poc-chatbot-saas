import { ForumOutlined as ForumOutlinedIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { ConversationBubbleProps } from './types';

export const FeedContainer = styled(Box)({
  flex: 1,
  minHeight: 0,
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 16,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 10,

  '&::-webkit-scrollbar': {
    width: '4px',
  },

  '&::-webkit-scrollbar-track': {
    background: 'transparent',
  },

  '&::-webkit-scrollbar-thumb': {
    background: 'rgba(255,255,255,0.15)',
    borderRadius: '2px',
  },
});

export const EmptyState = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 24,
});

export const PlaceholderIcon = styled(ForumOutlinedIcon)({
  color: 'rgba(240,244,248,0.2)',
  fontSize: 32,
});

export const PlaceholderText = styled(Typography)({
  color: 'rgba(240,244,248,0.4)',
  fontSize: '0.8rem',
});

export const BubbleRow = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'role',
})<ConversationBubbleProps>(({ role }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: role === 'user' ? 'flex-end' : 'flex-start',
  gap: 2,
}));

export const Bubble = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'role',
})<ConversationBubbleProps>(({ role }) => ({
  maxWidth: '78%',
  padding: '8px 12px',
  borderRadius: 10,
  backgroundColor: role === 'user' ? '#1f8cf9' : 'rgba(255,255,255,0.06)',
  color: role === 'user' ? '#f0f4f8' : 'rgba(240,244,248,0.92)',
  fontSize: '0.85rem',
  lineHeight: 1.5,
  wordBreak: 'break-word',
  whiteSpace: 'pre-wrap',
}));

export const SourceTag = styled(Typography)({
  color: 'rgba(240,244,248,0.35)',
  fontSize: '0.62rem',
  letterSpacing: '0.04em',
  textTransform: 'uppercase',
});
