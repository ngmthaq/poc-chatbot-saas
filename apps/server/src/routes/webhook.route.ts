import express, { Router } from 'express';
import { WebhookController } from '../controllers/webhook.controller';
import { responseHandler } from '../utils/response-handler.utils';

const router: Router = Router();
const webhookController = new WebhookController();

router.post(
  '/',
  express.text({ type: '*/*' }),
  responseHandler(webhookController.receive),
);

export default router;
