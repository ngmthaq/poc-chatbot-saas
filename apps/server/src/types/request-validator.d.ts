import type { AnyObjectSchema } from 'yup';

export type RequestValidatorOptions = {
  target: 'body' | 'params' | 'query' | 'headers';
  schema: AnyObjectSchema;
  prepare?: (data: unknown) => unknown;
};
