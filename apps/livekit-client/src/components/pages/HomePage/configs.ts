import { ConnectionState } from 'livekit-client';
import { type ConnectionChipColor } from './types';

export const CONNECTION_STATE_COLORS: Record<
  ConnectionState,
  ConnectionChipColor
> = {
  [ConnectionState.Connected]: 'success',
  [ConnectionState.Connecting]: 'info',
  [ConnectionState.Disconnected]: 'error',
  [ConnectionState.Reconnecting]: 'warning',
  [ConnectionState.SignalReconnecting]: 'warning',
};

export const CONNECTION_STATE_LABELS: Record<ConnectionState, string> = {
  [ConnectionState.Connected]: 'Connected',
  [ConnectionState.Connecting]: 'Connecting',
  [ConnectionState.Disconnected]: 'Disconnected',
  [ConnectionState.Reconnecting]: 'Reconnecting',
  [ConnectionState.SignalReconnecting]: 'Reconnecting',
};
