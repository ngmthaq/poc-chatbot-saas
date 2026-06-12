import { SmartToy as SmartToyIcon } from '@mui/icons-material';
import { Box, Divider, Typography } from '@mui/material';
import { styled } from '@mui/material/styles';

export const CardContainer = styled(Box)({
  backgroundColor: 'rgba(15,20,30,0.9)',
  border: '1px solid rgba(255,255,255,0.08)',
  borderRadius: 8,
  padding: 16,
});

export const AgentIcon = styled(SmartToyIcon)({
  color: '#1f8cf9',
  fontSize: 20,
});

export const NameContainer = styled(Box)({
  flex: 1,
  minWidth: 0,
});

export const DisplayName = styled(Typography)({
  color: '#f0f4f8',
  fontWeight: 700,
  lineHeight: 1.2,
  fontSize: '0.85rem',
});

export const IdentityText = styled(Typography)({
  color: 'rgba(240,244,248,0.6)',
  fontSize: '0.72rem',
});

export const MetadataDivider = styled(Divider)({
  borderColor: 'rgba(255,255,255,0.06)',
  marginBottom: 12,
});

export const MetadataText = styled(Typography)({
  color: 'rgba(240,244,248,0.5)',
  fontSize: '0.7rem',
});
