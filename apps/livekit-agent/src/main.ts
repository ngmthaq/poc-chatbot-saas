import { ServerOptions, cli, defineAgent, voice } from '@livekit/agents';
import * as livekit from '@livekit/agents-plugin-livekit';
import * as silero from '@livekit/agents-plugin-silero';
import { BackgroundVoiceCancellation } from '@livekit/noise-cancellation-node';
import { fileURLToPath } from 'node:url';
import { LLMAgent } from './agents';
import { providerFactory } from './agents/provider';
import { loadEnv } from './configs/env';
import type { ProcessUserData } from './types/process-user-data';

export default defineAgent<ProcessUserData>({
  prewarm: async (proc) => {
    proc.userData.vad = await silero.VAD.load();
  },

  entry: async (ctx) => {
    const env = loadEnv();
    const session = new voice.AgentSession({
      stt: providerFactory.stt(env.STT_PROVIDER),
      tts: providerFactory.tts(env.TTS_PROVIDER),
      turnDetection: new livekit.turnDetector.MultilingualModel(),
      vad: ctx.proc.userData.vad,
      voiceOptions: {
        preemptiveGeneration: true,
      },
    });

    await session.start({
      agent: new LLMAgent(),
      room: ctx.room,
      inputOptions: {
        noiseCancellation: BackgroundVoiceCancellation(),
      },
    });

    await ctx.connect();

    session.generateReply({
      instructions: 'Greet the user in a helpful and friendly manner.',
    });
  },
});

cli.runApp(
  new ServerOptions({
    agent: fileURLToPath(import.meta.url),
  }),
);
