import type { RequestHandler } from 'express';
import { roomService } from '../services/room.service';
import type { JoinRoomBody } from '../validators/room.validator';

export class RoomController {
  public readonly join: RequestHandler = (req) => {
    return roomService.join(req.body as JoinRoomBody);
  };
}

export const roomController = new RoomController();
