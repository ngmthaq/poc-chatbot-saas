import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { loadEnv } from '../configs';

// Prisma 7: the runtime client connects through a driver adapter instead of a
// `datasource.url` in the schema. `@prisma/adapter-pg` wraps the `pg` driver.
// `loadEnv()` guarantees `DATABASE_URL` is present and validated (and triggers
// the dotenv side-effect), so the connection string is a single source of truth
// shared with prisma.config.ts.
const { DATABASE_URL } = loadEnv();

// Cache the client on globalThis so `tsx watch` hot reloads reuse a single
// instance instead of opening a new connection pool on every reload.
const globalForPrisma = globalThis as typeof globalThis & {
  prisma?: PrismaClient;
};

const adapter = new PrismaPg({ connectionString: DATABASE_URL });

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient({ adapter });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

/**
 * Narrows an unknown error to a Prisma unique-constraint violation (`P2002`).
 */
export function isUniqueViolation(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002'
  );
}

/**
 * Narrows an unknown error to a Prisma "record not found" error (`P2025`),
 * raised by `update` when the target row does not exist.
 */
export function isRecordNotFound(err: unknown): boolean {
  return (
    err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2025'
  );
}
