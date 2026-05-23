import { Router } from 'express';
import { LiveKitController } from '../controllers/livekit.controller';
import { responseHandler } from '../utils/response-handler';
import { validateGetLiveKitToken } from '../validators/get-livekit-token.validator';

const router: Router = Router();
const liveKitController = new LiveKitController();

router.post('/token', validateGetLiveKitToken, responseHandler(liveKitController.getToken));

export default router;
