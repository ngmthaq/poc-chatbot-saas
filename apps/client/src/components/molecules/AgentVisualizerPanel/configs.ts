import type { AgentState } from '@livekit/components-react';

export const OVERLAY_STATES: ReadonlySet<AgentState> = new Set<AgentState>([
  'connecting',
  'initializing',
  'pre-connect-buffering',
  'thinking',
]);
