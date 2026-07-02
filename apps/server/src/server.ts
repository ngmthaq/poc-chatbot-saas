import { createApp } from './app';
import { loadEnv } from './configs';
import { loggerUtil } from './utils/logger.utils';
import { prismaUtil } from './utils/prisma.utils';

const config = loadEnv();

async function start(): Promise<void> {
  await prismaUtil.client.$connect();
  loggerUtil.instance.info('Database connected');

  const app = createApp();
  app.listen(config.PORT, () => {
    loggerUtil.instance.info({ port: config.PORT }, 'Server listening');
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  loggerUtil.instance.info({ signal }, 'Shutting down');
  await prismaUtil.client.$disconnect();
  process.exit(0);
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

start().catch((error: unknown) => {
  loggerUtil.instance.error({ error }, 'Failed to start server');
  process.exit(1);
});
