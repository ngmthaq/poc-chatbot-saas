import type { FC } from 'react';
import { STATE_CONFIG } from './configs';
import { StyledChip } from './styled';
import type { AgentStatusBadgeProps } from './types';

export const AgentStatusBadge: FC<AgentStatusBadgeProps> = ({ state }) => {
  const config = STATE_CONFIG[state];

  return <StyledChip label={config.label} color={config.color} size="small" />;
};
