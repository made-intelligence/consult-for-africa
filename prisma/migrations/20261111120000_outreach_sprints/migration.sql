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
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SprintTarget_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SprintTouch" (
    "id" TEXT NOT NULL,
    "targetId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
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

-- CreateIndex
CREATE UNIQUE INDEX "OutreachSprint_slug_key" ON "OutreachSprint"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "SprintMember_sprintId_userId_key" ON "SprintMember"("sprintId", "userId");

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
ALTER TABLE "SprintTouch" ADD CONSTRAINT "SprintTouch_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

