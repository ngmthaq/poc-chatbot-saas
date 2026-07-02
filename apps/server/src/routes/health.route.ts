import { Router } from 'express';
import { healthController } from '../controllers';
import { responseHandlerUtil } from '../utils';

const router: Router = Router();

router.get('/', responseHandlerUtil.handle(healthController.getStatus));

export default router;
