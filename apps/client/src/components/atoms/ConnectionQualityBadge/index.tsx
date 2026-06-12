import {
  ConnectionQualityIndicator,
  useConnectionQualityIndicator,
} from '@livekit/components-react';
import type { FC } from 'react';
import { QUALITY_LABELS } from './configs';
import { QualityLabel, Root } from './styled';
import type { ConnectionQualityBadgeProps } from './types';

export const ConnectionQualityBadge: FC<ConnectionQualityBadgeProps> = ({
  participant,
}) => {
  const { quality } = useConnectionQualityIndicator({ participant });

  return (
    <Root data-lk-theme="default">
      <ConnectionQualityIndicator participant={participant} />
      <QualityLabel variant="caption">{QUALITY_LABELS[quality]}</QualityLabel>
    </Root>
  );
};
