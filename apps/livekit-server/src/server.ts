import { createApp } from './app';
import { loadConfig } from './config/env';
import { logger } from './utils/logger.utils';

const config = loadConfig();
const app = createApp();
app.listen(config.port, () => {
  logger.info({ port: config.port }, 'Server listening');
});
