import { Router } from 'express';
import { configController } from '../controllers';
import { responseHandlerUtil } from '../utils';

const router: Router = Router();

router.get('/', responseHandlerUtil.handle(configController.getConfig));

export default router;
