import { inference } from '@livekit/agents';

export const STTAgent = () => {
  return new inference.STT({
    model: 'deepgram/nova-3',
    language: 'multi',
  });
};
