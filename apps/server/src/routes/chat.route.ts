import { ApiKeyScope } from '@prisma/client';
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { apiKeyAuth, requireBotBinding, requireScopes } from '../middlewares';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { responseHandler } from '../utils/response-handler.utils';
import { chatSchema } from '../validators/chat.validator';
import type { ChatBody } from '../validators/chat.validator';

const router: Router = Router();
const chatController = new ChatController();

router.post(
  '/',
  apiKeyAuth(),
  requireScopes(ApiKeyScope.CHAT),
  requestValidator({
    target: 'body',
    schema: chatSchema,
  }),
  requireBotBinding((req) => (req.body as ChatBody).botId ?? null),
  responseHandler(chatController.handleChat),
);

export default router;
