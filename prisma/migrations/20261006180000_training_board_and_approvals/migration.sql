-- Peer-to-peer training, a board tier for the founders, and the clinical
-- approval gate on anything that reaches a nurse.
--
-- BOARD is deliberately NOT a superset of LEADERSHIP. The founders sit above
-- leadership on the hospital's numbers and below everybody on anything about a
-- named person. A board that can read the ward's own notes, or see which nurse
-- failed which test, ends both within a month. The capability map in
-- lib/staffAuth.ts is the enforcement; this enum is only the label.
--
-- canApproveClinical is a person, not a tier. Dr Shakirah is a founder and so
-- BOARD, which is the weakest tier on anything clinical. Her authority to
-- approve is that she is a doctor supporting the Chief Medical Director.
--
-- Additive only.

-- AlterEnum
ALTER TYPE "StaffTier" ADD VALUE IF NOT EXISTS 'BOARD';

-- AlterTable
ALTER TABLE "StaffMember" ADD COLUMN "canApproveClinical" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
-- Cleared when version changes, so an edit cannot inherit the old approval.
ALTER TABLE "Protocol" ADD COLUMN "approvedById" TEXT;
ALTER TABLE "Protocol" ADD COLUMN "approvedAt" TIMESTAMP(3);
ALTER TABLE "Protocol" ADD COLUMN "approvalNote" TEXT;

-- AlterTable
ALTER TABLE "ScoreboardEntry" ADD COLUMN "visibility" "StaffTier" NOT NULL DEFAULT 'ALL_STAFF';

-- CreateEnum
CREATE TYPE "TrainingMode" AS ENUM ('ONSITE', 'VIRTUAL');
CREATE TYPE "TrainingStatus" AS ENUM ('SCHEDULED', 'HELD', 'CANCELLED');

-- CreateTable
CREATE TABLE "TrainingSession" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "description" TEXT,
    "protocolId" TEXT,
    "presenterId" TEXT,
    "scheduledAt" TIMESTAMP(3) NOT NULL,
    "mode" "TrainingMode" NOT NULL DEFAULT 'ONSITE',
    "whereAt" TEXT,
    "status" "TrainingStatus" NOT NULL DEFAULT 'SCHEDULED',
    "notes" TEXT,
    "invitedAt" TIMESTAMP(3),
    "remindedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TrainingSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- Expected rows are created when the session is scheduled, so an absence is
-- visible rather than merely unrecorded.
CREATE TABLE "TrainingAttendance" (
    "id" TEXT NOT NULL,
    "sessionId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "attended" BOOLEAN,
    "markedById" TEXT,
    "markedAt" TIMESTAMP(3),

    CONSTRAINT "TrainingAttendance_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "TrainingSession_clientId_scheduledAt_idx" ON "TrainingSession"("clientId", "scheduledAt");
CREATE UNIQUE INDEX "TrainingAttendance_sessionId_staffId_key" ON "TrainingAttendance"("sessionId", "staffId");
CREATE INDEX "TrainingAttendance_staffId_idx" ON "TrainingAttendance"("staffId");

-- AddForeignKey
ALTER TABLE "Protocol" ADD CONSTRAINT "Protocol_approvedById_fkey" FOREIGN KEY ("approvedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_protocolId_fkey" FOREIGN KEY ("protocolId") REFERENCES "Protocol"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingSession" ADD CONSTRAINT "TrainingSession_presenterId_fkey" FOREIGN KEY ("presenterId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TrainingAttendance" ADD CONSTRAINT "TrainingAttendance_sessionId_fkey" FOREIGN KEY ("sessionId") REFERENCES "TrainingSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TrainingAttendance" ADD CONSTRAINT "TrainingAttendance_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
