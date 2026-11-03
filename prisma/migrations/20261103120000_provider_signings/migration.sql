-- CreateEnum
CREATE TYPE "ProviderSigningStage" AS ENUM ('TARGET', 'CONTACTED', 'INTERESTED', 'SLA_SENT', 'SIGNED', 'DOCS_COMPLETE', 'WITH_CLIENT', 'PARKED');

-- CreateTable
CREATE TABLE "SigningProgramme" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "baselineSigned" INTEGER NOT NULL DEFAULT 0,
    "target" INTEGER NOT NULL DEFAULT 0,
    "deadline" TIMESTAMP(3),
    "weeklyTargets" JSONB,
    "senderName" TEXT NOT NULL,
    "slaFileKey" TEXT,
    "slaFileName" TEXT,
    "documentsChecklist" TEXT,
    "chaseEnabled" BOOLEAN NOT NULL DEFAULT false,
    "chaseDays" INTEGER[] DEFAULT ARRAY[2, 5, 9, 14]::INTEGER[],
    "chaseSubject" TEXT NOT NULL,
    "chaseBody" TEXT NOT NULL,
    "chaseApprovedById" TEXT,
    "chaseApprovedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "SigningProgramme_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSigning" (
    "id" TEXT NOT NULL,
    "programmeId" TEXT NOT NULL,
    "facility" TEXT NOT NULL,
    "groupName" TEXT,
    "facilityType" TEXT,
    "lga" TEXT,
    "area" TEXT,
    "contactName" TEXT,
    "contactRole" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "signatoryName" TEXT,
    "signatoryPhone" TEXT,
    "signatoryEmail" TEXT,
    "source" TEXT,
    "ownerId" TEXT,
    "stage" "ProviderSigningStage" NOT NULL DEFAULT 'TARGET',
    "firstContactAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "slaSentAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "docsCompleteAt" TIMESTAMP(3),
    "sentToClientAt" TIMESTAMP(3),
    "cadenceStep" INTEGER NOT NULL DEFAULT 0,
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "objection" TEXT,
    "notes" TEXT,
    "chaseCount" INTEGER NOT NULL DEFAULT 0,
    "lastChasedAt" TIMESTAMP(3),
    "chasePaused" BOOLEAN NOT NULL DEFAULT false,
    "returnToken" TEXT NOT NULL,
    "signedFileKey" TEXT,
    "signedFileName" TEXT,
    "documentKeys" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

CONSTRAINT "ProviderSigning_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProviderSigningEvent" (
    "id" TEXT NOT NULL,
    "signingId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "note" TEXT,
    "stage" "ProviderSigningStage",
    "actorId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

CONSTRAINT "ProviderSigningEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SigningProgramme_engagementId_idx" ON "SigningProgramme"("engagementId");

-- CreateIndex
CREATE UNIQUE INDEX "ProviderSigning_returnToken_key" ON "ProviderSigning"("returnToken");

-- CreateIndex
CREATE INDEX "ProviderSigning_programmeId_stage_idx" ON "ProviderSigning"("programmeId", "stage");

-- CreateIndex
CREATE INDEX "ProviderSigning_programmeId_ownerId_idx" ON "ProviderSigning"("programmeId", "ownerId");

-- CreateIndex
CREATE INDEX "ProviderSigning_nextActionAt_idx" ON "ProviderSigning"("nextActionAt");

-- CreateIndex
CREATE INDEX "ProviderSigningEvent_signingId_createdAt_idx" ON "ProviderSigningEvent"("signingId", "createdAt");

-- CreateIndex
CREATE INDEX "ProviderSigningEvent_actorId_createdAt_idx" ON "ProviderSigningEvent"("actorId", "createdAt");

-- AddForeignKey
ALTER TABLE "SigningProgramme" ADD CONSTRAINT "SigningProgramme_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSigning" ADD CONSTRAINT "ProviderSigning_programmeId_fkey" FOREIGN KEY ("programmeId") REFERENCES "SigningProgramme"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSigning" ADD CONSTRAINT "ProviderSigning_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSigningEvent" ADD CONSTRAINT "ProviderSigningEvent_signingId_fkey" FOREIGN KEY ("signingId") REFERENCES "ProviderSigning"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProviderSigningEvent" ADD CONSTRAINT "ProviderSigningEvent_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
