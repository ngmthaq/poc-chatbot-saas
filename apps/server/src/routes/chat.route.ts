import { ApiKeyScope } from '@prisma/client';
import { Router } from 'express';
import { chatController } from '../controllers';
import {
  apiKeyAuthMiddleware,
  apiKeyRateLimitMiddleware,
  requestValidatorMiddleware,
  requireBotBindingMiddleware,
  requireScopesMiddleware,
} from '../middlewares';
import { responseHandlerUtil } from '../utils';
import { type ChatBody, chatSchema } from '../validators';

const router: Router = Router();

router.post(
  '/',
  apiKeyAuthMiddleware.handle,
  apiKeyRateLimitMiddleware.handle,
  requireScopesMiddleware.handle(ApiKeyScope.CHAT),
  requestValidatorMiddleware.handle({
    target: 'body',
    schema: chatSchema,
  }),
  requireBotBindingMiddleware.handle(
    (req) => (req.body as ChatBody).botId ?? null,
  ),
  responseHandlerUtil.handle(chatController.handleChat),
);

export default router;
