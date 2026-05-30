import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import humps from 'humps';
import * as yup from 'yup';
import type { InferType } from 'yup';

export const getLiveKitTokenSchema = yup.object({
  roomName: yup.string().optional(),
  participantIdentity: yup.string().optional(),
  participantName: yup.string().optional(),
  participantMetadata: yup.string().optional(),
  participantAttributes: yup
    .object()
    .test(
      'is-string-record',
      'participantAttributes must be an object with string values',
      (value) => {
        if (value === undefined || value === null) return true;
        return Object.values(value).every((v) => typeof v === 'string');
      },
    )
    .optional(),
  roomConfig: yup.mixed().optional(),
});

export type GetLiveKitTokenBody = InferType<typeof getLiveKitTokenSchema>;

export const validateGetLiveKitToken: RequestHandler = (req, _res, next) => {
  const camelizeBody = humps.camelizeKeys(req.body);
  try {
    const validated = getLiveKitTokenSchema.validateSync(camelizeBody, {
      abortEarly: true,
      stripUnknown: true,
    });
    req.body = validated;
    next();
  } catch (err) {
    if (err instanceof yup.ValidationError) {
      next(createHttpError(422, err.message));
    } else {
      next(err);
    }
  }
};
