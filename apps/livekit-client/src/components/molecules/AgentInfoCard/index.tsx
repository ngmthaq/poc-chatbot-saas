import { AgentStatusBadge, ConnectionQualityBadge, MutedStatusDot } from '@/components/atoms';
import { Stack } from '@mui/material';
import {
  AgentIcon,
  CardContainer,
  DisplayName,
  IdentityText,
  MetadataDivider,
  MetadataText,
  NameContainer,
} from './styled';
import type { AgentInfoCardProps } from './types';

export const AgentInfoCard = ({
  state,
  identity,
  name,
  metadata,
  participant,
  microphoneTrack,
}: AgentInfoCardProps) => {
  const displayName = name || 'Anonymous Agent';

  return (
    <CardContainer>
      <Stack direction="row" alignItems="center" spacing={2}>
        <AgentIcon />
        <NameContainer>
          <DisplayName variant="subtitle2">{displayName}</DisplayName>
          <IdentityText variant="caption">{identity}</IdentityText>
        </NameContainer>
        {microphoneTrack !== undefined && <MutedStatusDot trackRef={microphoneTrack} label="Mic" />}
        <ConnectionQualityBadge participant={participant} />
        <AgentStatusBadge state={state} />
      </Stack>
      {metadata && (
        <>
          <MetadataDivider />
          <MetadataText variant="caption">{metadata}</MetadataText>
        </>
      )}
    </CardContainer>
  );
};
