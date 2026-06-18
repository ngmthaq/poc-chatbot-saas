-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "Provider" ADD VALUE 'INFERENCE';
ALTER TYPE "Provider" ADD VALUE 'GOOGLE';
ALTER TYPE "Provider" ADD VALUE 'DEEPGRAM';
ALTER TYPE "Provider" ADD VALUE 'ELEVEN';
ALTER TYPE "Provider" ADD VALUE 'CARTESIA';
ALTER TYPE "Provider" ADD VALUE 'NEUPHONIC';
ALTER TYPE "Provider" ADD VALUE 'RESEMBLE';
ALTER TYPE "Provider" ADD VALUE 'RIME';
ALTER TYPE "Provider" ADD VALUE 'INWORLD';
ALTER TYPE "Provider" ADD VALUE 'XAI';
ALTER TYPE "Provider" ADD VALUE 'FISH';
ALTER TYPE "Provider" ADD VALUE 'HUME';
