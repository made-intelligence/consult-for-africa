-- CreateEnum
CREATE TYPE "SafetyReportKind" AS ENUM ('NEAR_MISS', 'BROKEN');

-- CreateEnum
CREATE TYPE "SafetyReportStatus" AS ENUM ('NEW', 'INVESTIGATING', 'ACTION_AGREED', 'CLOSED');

-- CreateEnum
CREATE TYPE "SafetySeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH');

-- CreateTable
CREATE TABLE "SafetyReport" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "kind" "SafetyReportKind" NOT NULL,
    "sourceId" TEXT NOT NULL,
    "what" TEXT NOT NULL,
    "why" TEXT,
    "reachedPatient" TEXT,
    "reportedBy" TEXT,
    "reportedAt" TIMESTAMP(3) NOT NULL,
    "status" "SafetyReportStatus" NOT NULL DEFAULT 'NEW',
    "severity" "SafetySeverity",
    "investigatorId" TEXT,
    "takenAt" TIMESTAMP(3),
    "findings" TEXT,
    "action" TEXT,
    "actionOwner" TEXT,
    "actionDueAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "teamNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SafetyReport_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SafetyReport_sourceId_key" ON "SafetyReport"("sourceId");

-- CreateIndex
CREATE INDEX "SafetyReport_clientId_status_idx" ON "SafetyReport"("clientId", "status");

-- CreateIndex
CREATE INDEX "SafetyReport_investigatorId_idx" ON "SafetyReport"("investigatorId");

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SafetyReport" ADD CONSTRAINT "SafetyReport_investigatorId_fkey" FOREIGN KEY ("investigatorId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
