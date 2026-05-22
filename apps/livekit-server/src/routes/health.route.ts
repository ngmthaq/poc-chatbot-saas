import { Router } from 'express';
import { healthController } from '../controllers/health.controller';
import { responseHandler } from '../utils/response-handler';

const router: Router = Router();

router.get('/', responseHandler(healthController.getStatus));

export default router;
