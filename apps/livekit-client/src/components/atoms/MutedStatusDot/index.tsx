import { TrackMutedIndicator } from '@livekit/components-react';
import type { FC } from 'react';
import { Root, StatusLabel } from './styled';
import type { MutedStatusDotProps } from './types';

export const MutedStatusDot: FC<MutedStatusDotProps> = ({
  trackRef,
  label = 'Mic',
}) => {
  return (
    <Root data-lk-theme="default">
      <TrackMutedIndicator trackRef={trackRef} show="always" />
      <StatusLabel variant="caption">{label}</StatusLabel>
    </Root>
  );
};
