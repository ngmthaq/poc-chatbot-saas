import { Box, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const Root = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  gap: theme.spacing(0.75),
}));

export const StatusLabel = styled(Typography)({
  color: 'rgba(240,244,248,0.6)',
  fontSize: '0.72rem',
});
