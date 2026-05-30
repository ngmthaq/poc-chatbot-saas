import type { AgentState } from '@livekit/components-react';

export interface AgentStatusBadgeProps {
  state: AgentState;
}

export interface StatusConfig {
  label: string;
  color:
    | 'default'
    | 'primary'
    | 'secondary'
    | 'error'
    | 'info'
    | 'success'
    | 'warning';
}
