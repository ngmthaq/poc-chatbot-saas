import * as yup from 'yup';
import type { InferType } from 'yup';

export const adminRefreshSchema = yup.object({
  refreshToken: yup.string().trim().required('refreshToken is required'),
});

export type AdminRefreshBody = InferType<typeof adminRefreshSchema>;
