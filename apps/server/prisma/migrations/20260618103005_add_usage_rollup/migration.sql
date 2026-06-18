-- CreateTable
CREATE TABLE "UsageRollup" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "requestCount" INTEGER NOT NULL DEFAULT 0,
    "voiceMinutes" DECIMAL(65,30) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UsageRollup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UsageRollup_tenantId_periodStart_key" ON "UsageRollup"("tenantId", "periodStart");

-- CreateIndex
CREATE INDEX "UsageRollup_tenantId_idx" ON "UsageRollup"("tenantId");

-- AddForeignKey
ALTER TABLE "UsageRollup" ADD CONSTRAINT "UsageRollup_tenantId_fkey" FOREIGN KEY ("tenantId") REFERENCES "Tenant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
