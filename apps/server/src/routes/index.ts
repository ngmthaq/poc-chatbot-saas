import { Router } from 'express';
import healthRouter from './health.route';
import liveKitRouter from './livekit.route';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/livekit', liveKitRouter);

export default router;
