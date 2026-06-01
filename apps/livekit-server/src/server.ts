import { createApp } from './app';
import { loadEnv } from './configs';
import { logger } from './utils/logger.utils';

const config = loadEnv();
const app = createApp();
app.listen(config.PORT, () => {
  logger.info({ port: config.PORT }, 'Server listening');
});
