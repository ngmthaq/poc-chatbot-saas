import express, { Router } from 'express';
import { liveKitWebhookController } from '../controllers';
import { responseHandlerUtil } from '../utils';

const router: Router = Router();

router.post(
  '/',
  express.text({ type: '*/*' }),
  responseHandlerUtil.handle(liveKitWebhookController.receive),
);

export default router;
