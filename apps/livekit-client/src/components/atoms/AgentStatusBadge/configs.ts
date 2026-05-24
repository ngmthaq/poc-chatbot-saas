import type { AgentState } from '@livekit/components-react';
import type { StatusConfig } from './types';

export const STATE_CONFIG: Record<AgentState, StatusConfig> = {
  connecting: { label: 'Connecting', color: 'info' },
  initializing: { label: 'Initializing', color: 'info' },
  listening: { label: 'Listening', color: 'success' },
  thinking: { label: 'Thinking', color: 'warning' },
  speaking: { label: 'Speaking', color: 'primary' },
  idle: { label: 'Idle', color: 'default' },
  'pre-connect-buffering': { label: 'Buffering', color: 'info' },
  disconnected: { label: 'Disconnected', color: 'default' },
  failed: { label: 'Failed', color: 'error' },
};
