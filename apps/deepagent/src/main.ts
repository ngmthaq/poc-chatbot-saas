import { createChatAgent } from './agents';
import { createApp } from './server/app';
import { loadEnv } from './server/configs/env';
import { logger } from './server/utils/logger.utils';

const env = loadEnv();
const agent = createChatAgent();
const app = createApp(agent);

app.listen(env.PORT, () => {
  logger.info(`DeepAgent chatbot listening on port ${env.PORT}`);
});
