import type { UseAgentReturn } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';

export type ConnectionChipColor =
  | 'default'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

export type AgentCallState = {
  agent: UseAgentReturn;
  connectionState: ConnectionState;
  isPending: boolean;
  hasFailure: boolean;
  isFinishedClean: boolean;
};
