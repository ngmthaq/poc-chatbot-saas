import { Router } from 'express';
import humps from 'humps';
import { LiveKitController } from '../controllers/livekit.controller';
import { requestValidator } from '../middlewares/request-validator.middleware';
import { responseHandler } from '../utils/response-handler.utils';
import { getLiveKitTokenSchema } from '../validators/get-livekit-token.validator';

const router: Router = Router();
const liveKitController = new LiveKitController();

router.post(
  '/token',
  requestValidator({
    target: 'body',
    schema: getLiveKitTokenSchema,
    prepare: (d) => humps.camelizeKeys(d as object),
  }),
  responseHandler(liveKitController.getToken),
);

export default router;
