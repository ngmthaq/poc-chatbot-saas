import { ConnectionQuality } from 'livekit-client';

export const QUALITY_LABELS: Record<ConnectionQuality, string> = {
  [ConnectionQuality.Excellent]: 'Excellent',
  [ConnectionQuality.Good]: 'Good',
  [ConnectionQuality.Poor]: 'Poor',
  [ConnectionQuality.Lost]: 'Lost',
  [ConnectionQuality.Unknown]: 'Unknown',
};
