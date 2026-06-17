import { createApp } from './app';
import { loadEnv } from './configs';
import { logger } from './utils/logger.utils';
import { prisma } from './utils/prisma.utils';

const config = loadEnv();

async function start(): Promise<void> {
  await prisma.$connect();
  logger.info('Database connected');

  const app = createApp();
  app.listen(config.PORT, () => {
    logger.info({ port: config.PORT }, 'Server listening');
  });
}

async function shutdown(signal: NodeJS.Signals): Promise<void> {
  logger.info({ signal }, 'Shutting down');
  await prisma.$disconnect();
  process.exit(0);
}

process.on('SIGINT', (signal) => {
  void shutdown(signal);
});

process.on('SIGTERM', (signal) => {
  void shutdown(signal);
});

start().catch((error: unknown) => {
  logger.error({ error }, 'Failed to start server');
  process.exit(1);
});
