import dotenv from 'dotenv';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

// Prisma 7 no longer auto-loads `.env`. Mirror the app (src/configs/env.ts) and
// read the same `.env.local`, so `DATABASE_URL` has a single source of truth for
// both the runtime client and the CLI (migrate / generate / studio).
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

export default defineConfig({
  // Multi-file schema: every *.prisma file in this folder is loaded.
  schema: path.join('prisma', 'schema'),
  // Connection URL for CLI commands (migrate / introspect / studio). Read via
  // `process.env` (not the strict `env()` helper) so `prisma generate`, which
  // needs no DB connection, never fails when the URL is unset; migrate/studio
  // still require it. The runtime client connects via the @prisma/adapter-pg
  // driver adapter instead (see src/utils/prisma.utils.ts), and the app's Yup
  // schema enforces DATABASE_URL at boot.
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
