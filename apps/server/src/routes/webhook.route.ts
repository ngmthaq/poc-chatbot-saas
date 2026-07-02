import express, { Router } from 'express';
import { webhookController } from '../controllers';
import { responseHandlerUtil } from '../utils';

const router: Router = Router();

router.post(
  '/',
  express.text({ type: '*/*' }),
  responseHandlerUtil.handle(webhookController.receive),
);

export default router;
