import { Router } from 'express';
import { ConfigController } from '../controllers/config.controller';
import { responseHandler } from '../utils/response-handler.utils';

const router: Router = Router();
const configController = new ConfigController();

router.get('/', responseHandler(configController.getConfig));

export default router;
