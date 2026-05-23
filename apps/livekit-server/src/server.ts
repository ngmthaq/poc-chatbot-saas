import { createApp } from './app';
import { loadConfig } from './config/env';

const config = loadConfig();
const app = createApp();
app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
