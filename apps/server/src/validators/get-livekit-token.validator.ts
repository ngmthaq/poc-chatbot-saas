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
  mode: yup
    .string()
    .oneOf(['text', 'voice'], 'mode must be "text" or "voice"')
    .default('text'),
  roomConfig: yup.mixed().optional(),
});

export type GetLiveKitTokenBody = InferType<typeof getLiveKitTokenSchema>;
