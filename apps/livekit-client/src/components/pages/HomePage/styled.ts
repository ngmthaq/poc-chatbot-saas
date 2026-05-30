import {
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  HeadsetMic as HeadsetMicIcon,
} from '@mui/icons-material';
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';

export const PageRoot = styled(Box)({
  width: '100vw',
  height: '100vh',
  backgroundColor: '#0a0c10',
  display: 'flex',
  flexDirection: 'column',
  overflow: 'hidden',
});

export const PageHeader = styled('header')({
  paddingLeft: 24,
  paddingRight: 24,
  paddingTop: 12,
  paddingBottom: 12,
  borderBottom: '1px solid rgba(255,255,255,0.06)',
  display: 'flex',
  alignItems: 'center',
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

export const StatusChip = styled(Chip)({
  fontWeight: 600,
  fontSize: '0.7rem',
});

export const PageMain = styled('main')({
  flex: 1,
  overflow: 'hidden',
  display: 'flex',
  gap: 16,
  padding: 16,
  position: 'relative',
});

export const ColumnBox = styled(Box)({
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  gap: 16,
  minWidth: 0,
});

export const PendingOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  backgroundColor: 'rgba(10,12,16,0.85)',
  backdropFilter: 'blur(6px)',
});

export const PendingSpinner = styled(CircularProgress)({
  color: '#1f8cf9',
});

export const PendingText = styled(Typography)({
  color: 'rgba(240,244,248,0.7)',
  fontSize: '0.875rem',
});

export const FinishedOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 20,
  backgroundColor: 'rgba(10,12,16,0.9)',
  backdropFilter: 'blur(6px)',
});

export const SuccessIcon = styled(CheckCircleOutlineIcon)({
  color: '#22c55e',
  fontSize: 48,
});

export const OverlayTitle = styled(Typography)({
  color: '#f0f4f8',
  fontWeight: 700,
});

export const ReconnectButton = styled(Button)({
  backgroundColor: '#1f8cf9',
  '&:hover': { backgroundColor: '#1a7fe0' },
  fontWeight: 600,
});

export const FailureOverlay = styled(Box)({
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  gap: 16,
  backgroundColor: 'rgba(10,12,16,0.9)',
  backdropFilter: 'blur(6px)',
});

export const ErrorIcon = styled(ErrorOutlineIcon)({
  color: '#ef4444',
  fontSize: 48,
});

export const FailureReasonList = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  gap: 4,
});

export const FailureReasonText = styled(Typography)({
  color: 'rgba(240,244,248,0.6)',
  fontSize: '0.8rem',
});

export const TryAgainButton = styled(Button)({
  backgroundColor: '#ef4444',
  '&:hover': { backgroundColor: '#dc2626' },
  fontWeight: 600,
  marginTop: 4,
});

export const PageFooter = styled(Box)({
  paddingTop: 16,
  paddingBottom: 16,
  paddingLeft: 24,
  paddingRight: 24,
  borderTop: '1px solid rgba(255,255,255,0.06)',
});
