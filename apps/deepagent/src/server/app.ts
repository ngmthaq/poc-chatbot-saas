import express, { type Express } from 'express';
import type { ChatAgent } from '../agents';
import { errorHandler } from './middlewares/error-handler.middleware';
import { createChatRouter } from './routes/chat.route';

export function createApp(agent: ChatAgent): Express {
  const app = express();
  app.use(express.json());
  app.use(createChatRouter(agent));
  app.use(errorHandler);

  return app;
}
