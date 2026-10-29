-- Leave, requested from a phone and planned against the rota.
--
-- The hospital has no HR function, so this runs on a line manager and a form
-- rather than on an administrator. The useful part is not the request itself,
-- which a WhatsApp message already does badly. It is that whoever decides can
-- see how many people from the same department are already off on those days,
-- which is what stops the rota breaking in the November to February season.
--
-- Additive only.

-- CreateEnum
CREATE TYPE "StaffLeaveType" AS ENUM ('ANNUAL', 'SICK', 'COMPASSIONATE', 'STUDY', 'UNPAID');

-- CreateEnum
CREATE TYPE "StaffLeaveStatus" AS ENUM ('REQUESTED', 'APPROVED', 'DECLINED', 'CANCELLED');

-- AlterTable
-- Nigeria's statutory floor is six working days; most hospitals here run well
-- above it, so this is per person rather than a constant in code.
ALTER TABLE "StaffMember" ADD COLUMN "annualLeaveDays" INTEGER NOT NULL DEFAULT 20;

-- CreateTable
CREATE TABLE "StaffLeaveRequest" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "type" "StaffLeaveType" NOT NULL DEFAULT 'ANNUAL',
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "days" INTEGER NOT NULL,
    "reason" TEXT,
    "status" "StaffLeaveStatus" NOT NULL DEFAULT 'REQUESTED',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decisionNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffLeaveRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffLeaveRequest_staffId_startDate_idx" ON "StaffLeaveRequest"("staffId", "startDate");

-- CreateIndex
CREATE INDEX "StaffLeaveRequest_status_startDate_idx" ON "StaffLeaveRequest"("status", "startDate");

-- AddForeignKey
ALTER TABLE "StaffLeaveRequest" ADD CONSTRAINT "StaffLeaveRequest_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
-- SET NULL rather than CASCADE: if the person who approved leave later leaves
-- the hospital, the leave they approved must not vanish with them.
ALTER TABLE "StaffLeaveRequest" ADD CONSTRAINT "StaffLeaveRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
