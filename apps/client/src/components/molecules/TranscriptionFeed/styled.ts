import { RecordVoiceOver as RecordVoiceOverIcon } from '@mui/icons-material';
import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { TranscriptionEntryProps } from './types';

export const EmptyState = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 8,
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 24,
  minHeight: 80,
});

export const PlaceholderIcon = styled(RecordVoiceOverIcon)({
  color: 'rgba(240,244,248,0.2)',
  fontSize: 28,
});

export const PlaceholderText = styled(Typography)({
  color: 'rgba(240,244,248,0.4)',
  fontSize: '0.75rem',
});

export const FeedContainer = styled(Box)({
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 16,
  maxHeight: 160,
  overflowY: 'auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 6,

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

export const TranscriptionEntry = styled(Typography, {
  shouldForwardProp: (prop) => prop !== 'isLatest',
})<TranscriptionEntryProps>(({ isLatest }) => ({
  color: isLatest ? '#f0f4f8' : 'rgba(240,244,248,0.55)',
  fontSize: '0.82rem',
  lineHeight: 1.5,
  transition: 'color 0.2s ease',
}));
