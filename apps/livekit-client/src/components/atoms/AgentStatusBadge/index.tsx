import { STATE_CONFIG } from './configs';
import { StyledChip } from './styled';
import type { AgentStatusBadgeProps } from './types';

export const AgentStatusBadge = ({ state }: AgentStatusBadgeProps) => {
  const config = STATE_CONFIG[state];

  return <StyledChip label={config.label} color={config.color} size="small" />;
};
