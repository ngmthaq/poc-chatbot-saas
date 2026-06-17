import { Router } from 'express';
import chatRouter from './chat.route';
import configRouter from './config.route';
import healthRouter from './health.route';
import liveKitRouter from './livekit.route';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/livekit', liveKitRouter);
router.use('/chat', chatRouter);
router.use('/config', configRouter);

export default router;
