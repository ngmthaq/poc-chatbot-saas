import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import { styled } from '@mui/material/styles';

export const StyledToggleButtonGroup = styled(ToggleButtonGroup)({
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 2,
});

export const StyledToggleButton = styled(ToggleButton)({
  color: 'rgba(240,244,248,0.55)',
  border: 'none',
  borderRadius: 6,
  fontWeight: 600,
  fontSize: '0.78rem',
  letterSpacing: '0.02em',
  textTransform: 'none',
  paddingTop: 4,
  paddingBottom: 4,
  paddingLeft: 14,
  paddingRight: 14,
  gap: 6,

  '&.Mui-selected': {
    color: '#f0f4f8',
    backgroundColor: '#1f8cf9',
  },

  '&.Mui-selected:hover': {
    backgroundColor: '#1a7fe0',
  },
});
