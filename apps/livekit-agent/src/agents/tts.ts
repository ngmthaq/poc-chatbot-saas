import * as mistral from '@livekit/agents-plugin-mistralai';

export const TTSAgent = () => {
  return new mistral.TTS({
    model: 'voxtral-mini-tts-latest',
    voice: 'en_paul_neutral',
  });
};
