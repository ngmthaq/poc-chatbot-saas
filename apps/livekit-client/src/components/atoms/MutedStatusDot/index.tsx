import { TrackMutedIndicator } from '@livekit/components-react';
import { Root, StatusLabel } from './styled';
import type { MutedStatusDotProps } from './types';

export const MutedStatusDot = ({ trackRef, label = 'Mic' }: MutedStatusDotProps) => {
  return (
    <Root data-lk-theme="default">
      <TrackMutedIndicator trackRef={trackRef} show="always" />
      <StatusLabel variant="caption">{label}</StatusLabel>
    </Root>
  );
};
