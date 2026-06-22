import * as yup from 'yup';
import type { InferType } from 'yup';

export const adminLogoutSchema = yup.object({
  refreshToken: yup.string().trim().required('refreshToken is required'),
});

export type AdminLogoutBody = InferType<typeof adminLogoutSchema>;
