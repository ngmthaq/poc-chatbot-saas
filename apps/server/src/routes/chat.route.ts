import { ApiKeyScope } from '@prisma/client';
import { Router } from 'express';
import { ChatController } from '../controllers/chat.controller';
import { apiKeyAuth } from '../middlewares';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { responseHandler } from '../utils/response-handler.utils';
import { chatSchema } from '../validators/chat.validator';

const router: Router = Router();
const chatController = new ChatController();

router.post(
  '/',
  apiKeyAuth([ApiKeyScope.CHAT]),
  requestValidator({
    target: 'body',
    schema: chatSchema,
  }),
  responseHandler(chatController.handleChat),
);

export default router;
