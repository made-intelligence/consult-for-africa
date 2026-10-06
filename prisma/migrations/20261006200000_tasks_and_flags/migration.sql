-- Tasks, completions and flags.
--
-- A flag is a FACT about a record, never a judgement about a person. The system
-- can know objectively that a handover has no record against it. It cannot know
-- that a handover was poor. Quality is sampled by a human and fed back
-- privately, and building one mechanism for both accuses people of bad work on
-- the evidence of a missing tick, which in a hospital of nineteen loses the
-- reporting culture inside a fortnight.
--
-- Three flag levels and no more. Alert fatigue is a documented failure mode and
-- a system that cries wolf gets switched off in the mind long before it is
-- switched off in software.
--
-- Additive only.

-- CreateEnum
CREATE TYPE "StaffTaskCadence" AS ENUM ('EVERY_SHIFT', 'DAILY', 'WEEKLY', 'MONTHLY');
CREATE TYPE "FlagLevel" AS ENUM ('NUDGE', 'FLAG', 'ESCALATE');

-- CreateTable
CREATE TABLE "StaffTask" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "roles" TEXT[],
    "departments" TEXT[],
    "cadence" "StaffTaskCadence" NOT NULL,
    "evidence" TEXT NOT NULL,
    "why" TEXT NOT NULL,
    "graceHours" INTEGER NOT NULL DEFAULT 24,
    "flagLevel" "FlagLevel" NOT NULL DEFAULT 'NUDGE',
    "escalatesTo" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
-- forDate rather than a timestamp, so a night shift finishing at seven counts
-- for the day it belongs to.
CREATE TABLE "StaffTaskCompletion" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "forDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "note" TEXT,

    CONSTRAINT "StaffTaskCompletion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffTaskFlag" (
    "id" TEXT NOT NULL,
    "taskId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "forDate" TIMESTAMP(3) NOT NULL,
    "level" "FlagLevel" NOT NULL,
    "resolvedAt" TIMESTAMP(3),
    "resolvedById" TEXT,
    "resolution" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffTaskFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffTask_clientId_code_key" ON "StaffTask"("clientId", "code");
CREATE INDEX "StaffTask_clientId_isActive_idx" ON "StaffTask"("clientId", "isActive");
CREATE UNIQUE INDEX "StaffTaskCompletion_taskId_staffId_forDate_key" ON "StaffTaskCompletion"("taskId", "staffId", "forDate");
CREATE INDEX "StaffTaskCompletion_staffId_forDate_idx" ON "StaffTaskCompletion"("staffId", "forDate");
-- One flag per level per person per day: a task undone for a week should
-- escalate once, not seven times.
CREATE UNIQUE INDEX "StaffTaskFlag_taskId_staffId_forDate_level_key" ON "StaffTaskFlag"("taskId", "staffId", "forDate", "level");
CREATE INDEX "StaffTaskFlag_staffId_resolvedAt_idx" ON "StaffTaskFlag"("staffId", "resolvedAt");
CREATE INDEX "StaffTaskFlag_resolvedAt_idx" ON "StaffTaskFlag"("resolvedAt");

-- AddForeignKey
ALTER TABLE "StaffTask" ADD CONSTRAINT "StaffTask_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffTaskCompletion" ADD CONSTRAINT "StaffTaskCompletion_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "StaffTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffTaskCompletion" ADD CONSTRAINT "StaffTaskCompletion_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffTaskFlag" ADD CONSTRAINT "StaffTaskFlag_taskId_fkey" FOREIGN KEY ("taskId") REFERENCES "StaffTask"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffTaskFlag" ADD CONSTRAINT "StaffTaskFlag_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StaffTaskFlag" ADD CONSTRAINT "StaffTaskFlag_resolvedById_fkey" FOREIGN KEY ("resolvedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
