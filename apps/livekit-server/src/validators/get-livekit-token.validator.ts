import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import humps from 'humps';
import { z } from 'zod';

export const getLiveKitTokenSchema = z.object({
  roomName: z.string().optional(),
  participantIdentity: z.string().optional(),
  participantName: z.string().optional(),
  participantMetadata: z.string().optional(),
  participantAttributes: z.record(z.string()).optional(),
  roomConfig: z.any().optional(),
});

export type GetLiveKitTokenBody = z.infer<typeof getLiveKitTokenSchema>;

export const validateGetLiveKitToken: RequestHandler = (req, _res, next) => {
  const camelizeBody = humps.camelizeKeys(req.body);
  const result = getLiveKitTokenSchema.safeParse(camelizeBody);
  if (result.success) {
    req.body = result.data;
    next();
  } else {
    next(createHttpError(422, result.error.issues[0]?.message ?? 'Validation failed'));
  }
};
