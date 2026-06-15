import { HeadsetMic as HeadsetMicIcon } from '@mui/icons-material';
import { Box, Stack, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ShellRoot = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#0a0c10',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const ShellHeader = styled('header')({
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 12,
  paddingBottom: 12,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
  gap: 16,
});

export const HeaderStack = styled(Stack)({
  flex: 1,
});

export const BrandIcon = styled(HeadsetMicIcon)({
  color: '#1f8cf9',
  fontSize: 22,
});

export const RoomTitle = styled(Typography)({
  color: '#f0f4f8',
  fontWeight: 700,
  fontSize: '0.95rem',
  letterSpacing: '0.02em',
});

export const ShellBody = styled('main')({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  padding: 16,
});
