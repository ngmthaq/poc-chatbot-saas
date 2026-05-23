import { Router } from 'express';
import { HealthController } from '../controllers/health.controller';
import { responseHandler } from '../utils/response-handler';

const router: Router = Router();
const healthController = new HealthController();

router.get('/', responseHandler(healthController.getStatus));

export default router;
