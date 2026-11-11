-- The signing desk (/sprints). Additive, apart from removing the earlier
-- signing desk from PR #107 (SigningProgramme, ProviderSigning,
-- ProviderSigningEvent), whose tables were migrated on 3-4 Nov 2026, hold one
-- seed programme and no providers, and are replaced by this. Nothing else
-- references them.
DROP TABLE IF EXISTS "ProviderSigningEvent";
DROP TABLE IF EXISTS "ProviderSigning";
DROP TABLE IF EXISTS "SigningProgramme";
DROP TYPE IF EXISTS "ProviderSigningStage";
DELETE FROM "_prisma_migrations" WHERE "migration_name" IN ('20261103120000_provider_signings', '20261103200000_provider_signing_contacts');

-- CreateTable
CREATE TABLE "OutreachSprint" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "clientName" TEXT,
    "product" TEXT,
    "engagementId" TEXT,
    "goal" INTEGER NOT NULL,
    "baseline" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "weeklyTargets" JSONB,
    "briefUrl" TEXT,
    "agreementKey" TEXT,
    "agreementName" TEXT,
    "checklist" TEXT,
    "pitch" TEXT,
    "emails" JSONB,
    "testedHashes" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "autoChaseOn" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachSprint_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintMember" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "area" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SprintMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintTarget" (
    "id" TEXT NOT NULL,
    "sprintId" TEXT NOT NULL,
    "hospitalId" TEXT NOT NULL,
    "ownerId" TEXT,
    "stage" TEXT NOT NULL DEFAULT 'TARGET',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "area" TEXT,
    "source" TEXT,
    "notes" TEXT,
    "signatoryName" TEXT,
    "signatoryRole" TEXT,
    "signatoryPhone" TEXT,
    "signatoryEmail" TEXT,
    "nextAction" TEXT,
    "nextActionAt" TIMESTAMP(3),
    "chaseStep" INTEGER NOT NULL DEFAULT 0,
    "sentAt" TIMESTAMP(3),
    "signedAt" TIMESTAMP(3),
    "docsAt" TIMESTAMP(3),
    "handedOverAt" TIMESTAMP(3),
    "escalatedAt" TIMESTAMP(3),
    "escalationNote" TEXT,
    "closedReason" TEXT,
    "lastTouchAt" TIMESTAMP(3),
    "touchCount" INTEGER NOT NULL DEFAULT 0,
    "token" TEXT,
    "linkSentAt" TIMESTAMP(3),
    "linkOpenedAt" TIMESTAMP(3),
    "packReadyAt" TIMESTAMP(3),
    "autoChases" INTEGER NOT NULL DEFAULT 0,
    "lastAutoChaseAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintTouch" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT,
    "actor" TEXT NOT NULL DEFAULT 'STAFF',
    "channel" TEXT NOT NULL,
    "outcome" TEXT NOT NULL,
    "spokeTo" TEXT,
    "said" TEXT,
    "needs" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "note" TEXT,
    "stageFrom" TEXT,
    "stageTo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SprintTouch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintFile" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "fileName" TEXT NOT NULL,
    "contentType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "signedBy" TEXT,
    "rejectedAt" TIMESTAMP(3),
    "rejectNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SprintFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "OutreachSprint_slug_key" ON "OutreachSprint"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SprintMember_sprintId_userId_key" ON "SprintMember"("sprintId", "userId");

-- CreateIndex
CREATE UNIQUE INDEX "SprintTarget_token_key" ON "SprintTarget"("token");

-- CreateIndex
CREATE INDEX "SprintTarget_sprintId_ownerId_stage_idx" ON "SprintTarget"("sprintId", "ownerId", "stage");

-- CreateIndex
CREATE INDEX "SprintTarget_sprintId_nextActionAt_idx" ON "SprintTarget"("sprintId", "nextActionAt");

-- CreateIndex
CREATE INDEX "SprintTarget_sprintId_signedAt_idx" ON "SprintTarget"("sprintId", "signedAt");

-- CreateIndex
CREATE UNIQUE INDEX "SprintTarget_sprintId_hospitalId_key" ON "SprintTarget"("sprintId", "hospitalId");

-- CreateIndex
CREATE INDEX "SprintTouch_targetId_createdAt_idx" ON "SprintTouch"("targetId", "createdAt");

-- CreateIndex
CREATE INDEX "SprintTouch_userId_createdAt_idx" ON "SprintTouch"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "SprintFile_key_key" ON "SprintFile"("key");

-- CreateIndex
CREATE INDEX "SprintFile_targetId_createdAt_idx" ON "SprintFile"("targetId", "createdAt");

-- AddForeignKey
ALTER TABLE "SprintMember" ADD CONSTRAINT "SprintMember_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "OutreachSprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintMember" ADD CONSTRAINT "SprintMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTarget" ADD CONSTRAINT "SprintTarget_sprintId_fkey" FOREIGN KEY ("sprintId") REFERENCES "OutreachSprint"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTarget" ADD CONSTRAINT "SprintTarget_hospitalId_fkey" FOREIGN KEY ("hospitalId") REFERENCES "Hospital"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTarget" ADD CONSTRAINT "SprintTarget_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTouch" ADD CONSTRAINT "SprintTouch_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "SprintTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintTouch" ADD CONSTRAINT "SprintTouch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SprintFile" ADD CONSTRAINT "SprintFile_targetId_fkey" FOREIGN KEY ("targetId") REFERENCES "SprintTarget"("id") ON DELETE CASCADE ON UPDATE CASCADE;

