export interface WorkerConfig {
  readonly livekitUrl: string;
  readonly livekitApiKey: string;
  readonly livekitApiSecret: string;
  readonly agentName: string;
  readonly logLevel: LogLevel;
}

export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

const LOG_LEVELS: ReadonlyArray<LogLevel> = ['trace', 'debug', 'info', 'warn', 'error', 'fatal'];

const REQUIRED_KEYS = [
  'LIVEKIT_URL',
  'LIVEKIT_API_KEY',
  'LIVEKIT_API_SECRET',
  'AGENT_NAME',
] as const;

export class WorkerConfigError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'WorkerConfigError';
  }
}

export function loadConfig(env: NodeJS.ProcessEnv = process.env): WorkerConfig {
  const missing: string[] = [];
  for (const key of REQUIRED_KEYS) {
    const value = env[key];
    if (value === undefined || value.trim() === '') {
      missing.push(key);
    }
  }

  if (missing.length > 0) {
    throw new WorkerConfigError(
      `Missing required environment variable(s): ${missing.join(', ')}. ` +
        `See agent-worker/.env.example.`,
    );
  }

  const livekitUrl = env.LIVEKIT_URL!.trim();
  if (!/^wss?:\/\//i.test(livekitUrl)) {
    throw new WorkerConfigError(
      `LIVEKIT_URL must start with ws:// or wss://; received "${livekitUrl}".`,
    );
  }

  const logLevel = parseLogLevel(env.LOG_LEVEL);

  return Object.freeze({
    livekitUrl,
    livekitApiKey: env.LIVEKIT_API_KEY!.trim(),
    livekitApiSecret: env.LIVEKIT_API_SECRET!.trim(),
    agentName: env.AGENT_NAME!.trim(),
    logLevel,
  });
}

function parseLogLevel(raw: string | undefined): LogLevel {
  if (raw === undefined || raw.trim() === '') {
    return 'info';
  }
  const normalized = raw.trim().toLowerCase() as LogLevel;
  if (!LOG_LEVELS.includes(normalized)) {
    throw new WorkerConfigError(
      `LOG_LEVEL must be one of ${LOG_LEVELS.join(', ')}; received "${raw}".`,
    );
  }
  return normalized;
}
