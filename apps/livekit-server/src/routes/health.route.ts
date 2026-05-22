import { Router } from 'express';
import { healthController } from '../controllers/health.controller';

const router: Router = Router();

router.get('/', healthController.getStatus);

export default router;
