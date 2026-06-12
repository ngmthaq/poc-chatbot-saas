import { AudioTrack, BarVisualizer } from '@livekit/components-react';
import type { TrackReferenceOrPlaceholder } from '@livekit/components-react';
import { Box } from '@mui/material';
import { type FC, useMemo } from 'react';
import { OVERLAY_STATES } from './configs';
import {
  OverlayText,
  StyledProgress,
  VisualizerOverlay,
  VisualizerRoot,
} from './styled';
import type { AgentVisualizerPanelProps } from './types';

export const AgentVisualizerPanel: FC<AgentVisualizerPanelProps> = ({
  agentState,
  audioTrack,
}) => {
  const { showOverlay, isSpeaking } = useMemo(() => {
    return {
      showOverlay: OVERLAY_STATES.has(agentState),
      isSpeaking: agentState === 'speaking',
    };
  }, [agentState]);

  const barVisualizerProps = useMemo(() => {
    return audioTrack !== undefined ? { trackRef: audioTrack } : {};
  }, [audioTrack]);

  return (
    <VisualizerRoot data-lk-theme="default" isSpeaking={isSpeaking}>
      <Box
        component="div"
        style={{
          ['--lk-va-bar-width' as string]: '6px',
          ['--lk-va-bar-gap' as string]: '10px',
          ['--lk-va-bar-border-radius' as string]: '4px',
          ['--lk-fg' as string]: '#1f8cf9',
          ['--lk-va-bar-bg' as string]: 'rgba(255,255,255,0.08)',
          display: 'contents',
        }}
      >
        {audioTrack !== undefined && (
          <AudioTrack
            trackRef={
              audioTrack as Parameters<typeof AudioTrack>[0]['trackRef'] &
                TrackReferenceOrPlaceholder
            }
          />
        )}
        <BarVisualizer
          {...barVisualizerProps}
          state={agentState}
          barCount={28}
          style={{ width: '100%', height: '100%' }}
        />
      </Box>
      {showOverlay && (
        <VisualizerOverlay>
          <StyledProgress size={32} />
          <OverlayText variant="caption">
            {agentState === 'thinking' ? 'Agent is thinking…' : 'Connecting…'}
          </OverlayText>
        </VisualizerOverlay>
      )}
    </VisualizerRoot>
  );
};
