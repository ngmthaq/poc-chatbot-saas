import { Router } from 'express';
import type { ChatAgent } from '../../agents';
import { ChatController } from '../controllers/chat.controller';

export function createChatRouter(agent: ChatAgent): Router {
  const router = Router();
  const controller = new ChatController(agent);

  router.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  router.post('/chat', controller.handleChat);

  return router;
}
