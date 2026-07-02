import { TenantStatus } from '@prisma/client';
import * as yup from 'yup';
import type { InferType } from 'yup';

const slugRule = yup
  .string()
  .trim()
  .lowercase()
  .matches(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    'slug must be lowercase alphanumeric words separated by single hyphens',
  );

export const createTenantSchema = yup.object({
  name: yup.string().trim().required('name is required'),
  slug: slugRule.clone().required('slug is required'),
});

export const updateTenantSchema = yup
  .object({
    name: yup.string().trim(),
    slug: slugRule.clone(),
    status: yup
      .mixed<TenantStatus>()
      .oneOf(Object.values(TenantStatus), 'status is invalid'),
  })
  .test(
    'at-least-one-field',
    'at least one field is required',
    (value) =>
      value.name !== undefined ||
      value.slug !== undefined ||
      value.status !== undefined,
  );

export const listTenantsQuerySchema = yup.object({
  page: yup.number().integer().min(1).default(1),
  limit: yup.number().integer().min(1).max(100).default(20),
  search: yup.string().trim(),
});

export type CreateTenantBody = InferType<typeof createTenantSchema>;
export type UpdateTenantBody = InferType<typeof updateTenantSchema>;
export type ListTenantsQuery = InferType<typeof listTenantsQuerySchema>;
