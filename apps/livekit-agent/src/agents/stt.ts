import * as mistral from '@livekit/agents-plugin-mistralai';

export const STTAgent = () => {
  return new mistral.STT({
    model: 'voxtral-mini-transcribe-realtime-2602',
    language: 'multi',
  });
};
