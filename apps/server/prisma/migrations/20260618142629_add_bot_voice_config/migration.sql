-- AlterTable
ALTER TABLE "Bot" ADD COLUMN     "voiceEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "stt" "Provider",
ADD COLUMN     "tts" "Provider",
ADD COLUMN     "voiceId" TEXT;
