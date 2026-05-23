import { Router } from 'express';
import { roomController } from '../controllers/room.controller';
import { responseHandler } from '../utils/response-handler';
import { validateJoinRoom } from '../validators/room.validator';

const router: Router = Router();

router.post('/join', validateJoinRoom, responseHandler(roomController.join));

export default router;
