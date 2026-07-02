import { PrismaPg } from '@prisma/adapter-pg';
import { Prisma, PrismaClient } from '@prisma/client';
import { loadEnv } from '../configs';

export class PrismaUtil {
  // Cache the client on globalThis so `tsx watch` hot reloads reuse a single
  // instance instead of opening a new connection pool on every reload.
  private readonly globalForPrisma = globalThis as typeof globalThis & {
    prisma?: PrismaClient;
  };
  // Prisma 7: the runtime client connects through a driver adapter instead of a
  // `datasource.url` in the schema. `@prisma/adapter-pg` wraps the `pg` driver.
  private readonly adapter: PrismaPg;
  readonly client: PrismaClient;

  constructor() {
    // `loadEnv()` guarantees `DATABASE_URL` is present and validated (and
    // triggers the dotenv side-effect), so the connection string is a single
    // source of truth shared with prisma.config.ts.
    const { DATABASE_URL } = loadEnv();
    this.adapter = new PrismaPg({ connectionString: DATABASE_URL });
    this.client =
      this.globalForPrisma.prisma ??
      new PrismaClient({ adapter: this.adapter });
    if (process.env.NODE_ENV !== 'production') {
      this.globalForPrisma.prisma = this.client;
    }
  }

  /**
   * Narrows an unknown error to a Prisma unique-constraint violation (`P2002`).
   */
  isUniqueViolation(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2002'
    );
  }

  /**
   * Narrows an unknown error to a Prisma "record not found" error (`P2025`),
   * raised by `update` when the target row does not exist.
   */
  isRecordNotFound(err: unknown): boolean {
    return (
      err instanceof Prisma.PrismaClientKnownRequestError &&
      err.code === 'P2025'
    );
  }
}

export const prismaUtil = new PrismaUtil();
