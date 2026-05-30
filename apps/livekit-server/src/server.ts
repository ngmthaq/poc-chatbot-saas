import { createApp } from './app';
import { loadConfig } from './configs/env';
import { logger } from './utils/logger.utils';

const config = loadConfig();
const app = createApp();
app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'Server listening');
});
