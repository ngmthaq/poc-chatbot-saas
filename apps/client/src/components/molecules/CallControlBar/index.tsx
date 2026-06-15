import {
  DisconnectButton,
  StartAudio,
  VoiceAssistantControlBar,
} from '@livekit/components-react';
import type { FC } from 'react';
import { ControlBarRoot } from './styled';
import type { CallControlBarProps } from './types';

export const CallControlBar: FC<CallControlBarProps> = ({ onLeave }) => {
  return (
    <ControlBarRoot data-lk-theme="default">
      <StartAudio label="Enable Audio" />
      <VoiceAssistantControlBar
        style={{ borderTop: 'none' }}
        controls={{ microphone: true, leave: false }}
      />
      <DisconnectButton onClick={onLeave}>Leave</DisconnectButton>
    </ControlBarRoot>
  );
};
