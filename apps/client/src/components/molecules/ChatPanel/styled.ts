import { Box, IconButton, TextField, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const PanelRoot = styled('form')({
  display: 'flex',
  flexDirection: 'column',
  gap: 6,
});

export const InputRow = styled(Box)({
  display: 'flex',
  alignItems: 'flex-end',
  gap: 8,
});

export const MessageField = styled(TextField)({
  flex: 1,

  '& .MuiOutlinedInput-root': {
    backgroundColor: 'rgba(15,20,30,0.9)',
    color: '#f0f4f8',
    borderRadius: 8,
    fontSize: '0.88rem',

    '& fieldset': {
      borderColor: 'rgba(255,255,255,0.12)',
    },

    '&:hover fieldset': {
      borderColor: 'rgba(255,255,255,0.24)',
    },

    '&.Mui-focused fieldset': {
      borderColor: '#1f8cf9',
    },
  },
});

export const SendButton = styled(IconButton)({
  backgroundColor: '#1f8cf9',
  color: '#f0f4f8',
  width: 44,
  height: 44,

  '&:hover': {
    backgroundColor: '#1a7fe0',
  },

  '&.Mui-disabled': {
    backgroundColor: 'rgba(31,140,249,0.35)',
    color: 'rgba(240,244,248,0.5)',
  },
});

export const ErrorText = styled(Typography)({
  color: '#ef4444',
  fontSize: '0.75rem',
});
