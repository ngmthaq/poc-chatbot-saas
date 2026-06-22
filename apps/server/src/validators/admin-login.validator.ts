import * as yup from 'yup';
import type { InferType } from 'yup';

export const adminLoginSchema = yup.object({
  email: yup
    .string()
    .trim()
    .email('email must be valid')
    .required('email is required'),
  password: yup.string().required('password is required'),
});

export type AdminLoginBody = InferType<typeof adminLoginSchema>;
