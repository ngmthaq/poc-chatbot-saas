import { Router } from 'express';
import healthRouter from './health.route';
import roomRouter from './room.route';

const router: Router = Router();

router.use('/health', healthRouter);
router.use('/rooms', roomRouter);

export default router;
