import { Router } from 'express';
import humps from 'humps';
import { livekitController } from '../controllers';
import { requestValidatorMiddleware } from '../middlewares';
import { responseHandlerUtil } from '../utils';
import { getLiveKitTokenSchema } from '../validators';

const router: Router = Router();

router.post(
  '/token',
  requestValidatorMiddleware.handle({
    target: 'body',
    schema: getLiveKitTokenSchema,
    prepare: (d) => humps.camelizeKeys(d as object),
  }),
  responseHandlerUtil.handle(livekitController.getToken),
);

export default router;
