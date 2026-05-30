import { useAgent, useConnectionState } from '@livekit/components-react';
import { ConnectionState } from 'livekit-client';
import { useMemo } from 'react';
import type { AgentCallState } from './types';

export const useAgentCallState = (): AgentCallState => {
  const agent = useAgent();
  const connectionState = useConnectionState();

  const isPending = useMemo(
    () => agent.isPending || connectionState === ConnectionState.Connecting,
    [agent.isPending, connectionState],
  );

  const hasFailure = useMemo(
    () =>
      agent.isFinished &&
      agent.failureReasons !== null &&
      agent.failureReasons.length > 0,
    [agent.isFinished, agent.failureReasons],
  );

  const isFinishedClean = useMemo(
    () =>
      agent.isFinished &&
      (agent.failureReasons === null || agent.failureReasons.length === 0),
    [agent.isFinished, agent.failureReasons],
  );

  return { agent, connectionState, isPending, hasFailure, isFinishedClean };
};
