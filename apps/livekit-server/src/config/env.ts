import dotenv from 'dotenv';
import path from 'node:path';

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const parsePort = (raw: string | undefined): number => {
  const DEFAULT_PORT = 3000;
  if (raw === undefined || raw === '') return DEFAULT_PORT;
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? parsed : DEFAULT_PORT;
};

const parseRequiredString = (
  raw: string | undefined,
  keyName: string,
): string => {
  if (raw === undefined) {
    throw new Error(`Missing required env var: ${keyName}`);
  }
  const trimmed = raw.trim();
  if (trimmed === '') {
    throw new Error(`Missing required env var: ${keyName}`);
  }
  return trimmed;
};

let config = {} as Readonly<{
  port: number;
  nodeEnv: string;
  livekit: {
    apiKey: string;
    apiSecret: string;
    url: string;
    agentName: string;
  };
}>;

function loadConfig() {
  if (Object.keys(config).length === 0) {
    config = {
      port: parsePort(process.env.PORT),
      nodeEnv: process.env.NODE_ENV ?? 'development',
      livekit: {
        apiKey: parseRequiredString(
          process.env.LIVEKIT_API_KEY,
          'LIVEKIT_API_KEY',
        ),
        apiSecret: parseRequiredString(
          process.env.LIVEKIT_API_SECRET,
          'LIVEKIT_API_SECRET',
        ),
        url: parseRequiredString(process.env.LIVEKIT_URL, 'LIVEKIT_URL'),
        agentName: parseRequiredString(
          process.env.LIVEKIT_AGENT_NAME,
          'LIVEKIT_AGENT_NAME',
        ),
      } as const,
    } as const;
  }

  return config;
}

export { loadConfig };
