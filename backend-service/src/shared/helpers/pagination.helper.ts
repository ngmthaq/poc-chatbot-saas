import { OffsetLimit, PaginatedResult } from '../interfaces';

export function toOffsetLimit(page = 1, limit = 20): OffsetLimit {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));
  return {
    skip: (safePage - 1) * safeLimit,
    take: safeLimit,
  };
}

export function toPaginated<T>(
  items: T[],
  total: number,
  page = 1,
  limit = 20,
): PaginatedResult<T> {
  const safePage = Math.max(1, Math.floor(page));
  const safeLimit = Math.max(1, Math.floor(limit));
  const totalPages = safeLimit > 0 ? Math.ceil(total / safeLimit) : 0;
  return {
    items,
    meta: {
      page: safePage,
      limit: safeLimit,
      total,
      totalPages,
      hasNext: safePage < totalPages,
      hasPrev: safePage > 1,
    },
  };
}
