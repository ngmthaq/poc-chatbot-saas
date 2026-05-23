import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { z } from 'zod';

export const joinRoomSchema = z.object({
  identity: z.string().min(1),
  name: z.string().optional(),
});

export type JoinRoomBody = z.infer<typeof joinRoomSchema>;

export const validateJoinRoom: RequestHandler = (req, _res, next) => {
  const result = joinRoomSchema.safeParse(req.body);
  if (result.success) {
    req.body = result.data;
    next();
  } else {
    next(createHttpError(422, result.error.issues[0]?.message ?? 'Validation failed'));
  }
};
