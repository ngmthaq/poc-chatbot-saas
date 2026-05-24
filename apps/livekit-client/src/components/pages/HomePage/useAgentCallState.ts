import { useAgent, useConnectionState } from '@livekit/components-react';
import type { UseAgentReturn } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { useMemo } from 'react';

export type AgentCallState = {
  agent: UseAgentReturn;
  connectionState: ConnectionState;
  isPending: boolean;
  hasFailure: boolean;
  isFinishedClean: boolean;
};

export const useAgentCallState = (): AgentCallState => {
  const agent = useAgent();
  const connectionState = useConnectionState();

  const isPending = useMemo(
    () => agent.isPending || connectionState === ConnectionState.Connecting,
    [agent.isPending, connectionState],
  );

  const hasFailure = useMemo(
    () => agent.isFinished && agent.failureReasons !== null && agent.failureReasons.length > 0,
    [agent.isFinished, agent.failureReasons],
  );

  const isFinishedClean = useMemo(
    () => agent.isFinished && (agent.failureReasons === null || agent.failureReasons.length === 0),
    [agent.isFinished, agent.failureReasons],
  );

  return { agent, connectionState, isPending, hasFailure, isFinishedClean };
};
