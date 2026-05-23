import { Router } from 'express';
import { RoomController } from '../controllers/room.controller';
import { responseHandler } from '../utils/response-handler';
import { validateJoinRoom } from '../validators/room.validator';

const router: Router = Router();
const roomController = new RoomController();

router.post('/join', validateJoinRoom, responseHandler(roomController.join));

export default router;
