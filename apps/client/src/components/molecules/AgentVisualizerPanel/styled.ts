import { Box, CircularProgress, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';
import type { VisualizerRootProps } from './types';

export const VisualizerRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isSpeaking',
})<VisualizerRootProps>(({ isSpeaking }) => ({
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  overflow: 'hidden',
  flex: 1,
  minHeight: 0,
  boxShadow: isSpeaking ? '0 0 20px rgba(31,140,249,0.4)' : 'none',
  transition: 'box-shadow 0.3s ease',
}));

export const VisualizerOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 12,
  backgroundColor: 'rgba(10,12,16,0.6)',
  backdropFilter: 'blur(4px)',
});

export const StyledProgress = styled(CircularProgress)({
  color: '#1f8cf9',
});

export const OverlayText = styled(Typography)({
  color: 'rgba(240,244,248,0.7)',
  fontSize: '0.78rem',
});
