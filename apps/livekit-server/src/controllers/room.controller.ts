import type { RequestHandler } from 'express';
import { RoomService } from '../services/room.service';
import type { JoinRoomBody } from '../validators/room.validator';

export class RoomController {
  private readonly roomService = new RoomService();

  public readonly join: RequestHandler = (req) => {
    return this.roomService.join(req.body as JoinRoomBody);
  };
}
