import { inference } from '@livekit/agents';

export const TTSAgent = () => {
  return new inference.TTS({
    model: 'cartesia/sonic-3',
    voice: '9626c31c-bec5-4cca-baa8-f8ba9e84c8bc',
  });
};
