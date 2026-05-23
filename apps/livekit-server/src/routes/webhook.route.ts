import express, { Router } from 'express';
import { webhookController } from '../controllers/webhook.controller';
import { responseHandler } from '../utils/response-handler';

const router: Router = Router();

router.post('/', express.text({ type: '*/*' }), responseHandler(webhookController.receive));

export default router;
