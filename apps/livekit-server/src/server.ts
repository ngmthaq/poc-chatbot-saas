import dotenv from 'dotenv';
import { createApp } from './app';
import { config } from './config/env';

dotenv.config({ path: '.env.local' });

const app = createApp();

app.listen(config.port, () => {
  console.log(`Server listening on port ${config.port}`);
});
