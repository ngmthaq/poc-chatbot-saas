import { Box } from '@mui/material';
import { styled } from '@mui/material/styles';

export const ChatViewRoot = styled(Box)({
  flex: 1,
  minHeight: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
});

export const InputDock = styled(Box)({
  flexShrink: 0,
});
