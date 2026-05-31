import type { RequestHandler } from 'express';
import createHttpError from 'http-errors';
import { type AnyObjectSchema, ValidationError } from 'yup';

export type RequestValidatorOptions = {
  target: 'body' | 'params' | 'query' | 'headers';
  schema: AnyObjectSchema;
  prepare?: (data: unknown) => unknown;
};

export function requestValidator(
  options: RequestValidatorOptions,
): RequestHandler {
  return (req, _res, next) => {
    const reqRecord = req as unknown as Record<string, unknown>;
    const raw = reqRecord[options.target];
    const data = options.prepare !== undefined ? options.prepare(raw) : raw;

    try {
      const validated = options.schema.validateSync(data, {
        abortEarly: true,
        stripUnknown: true,
      });
      reqRecord[options.target] = validated;
      next();
    } catch (err) {
      if (err instanceof ValidationError) {
        next(createHttpError(422, err.message));
      } else {
        next(err);
      }
    }
  };
}
