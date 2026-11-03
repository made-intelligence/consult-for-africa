-- CreateEnum
CREATE TYPE "ObjectiveLevel" AS ENUM ('BOARD', 'TEAM');

-- CreateEnum
CREATE TYPE "ObjectiveStatus" AS ENUM ('DRAFT', 'PROPOSED', 'AGREED', 'CLOSED');

-- CreateEnum
CREATE TYPE "KeyResultKind" AS ENUM ('RESULT', 'GUARD');

-- AlterTable
ALTER TABLE "StaffMember" ADD COLUMN     "teamId" TEXT;

-- AlterTable
ALTER TABLE "ProtocolProgress" ADD COLUMN     "nextReviewAt" TIMESTAMP(3),
ADD COLUMN     "reviewStage" INTEGER NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE "StaffTeam" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "purpose" TEXT,
    "leadId" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffTeam_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TeamHuddle" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "ledById" TEXT,
    "attendees" TEXT[],
    "safety" TEXT,
    "focus" TEXT,
    "blocker" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TeamHuddle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Objective" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "level" "ObjectiveLevel" NOT NULL,
    "teamId" TEXT,
    "parentId" TEXT,
    "quarter" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "why" TEXT,
    "status" "ObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "proposalNote" TEXT,
    "agreedById" TEXT,
    "agreedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Objective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResult" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "kind" "KeyResultKind" NOT NULL DEFAULT 'RESULT',
    "title" TEXT NOT NULL,
    "baseline" TEXT,
    "target" TEXT,
    "current" TEXT,
    "confidence" INTEGER,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "KeyResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyResultCheckIn" (
    "id" TEXT NOT NULL,
    "keyResultId" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "confidence" INTEGER,
    "note" TEXT,
    "byId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyResultCheckIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffTeam_clientId_key_key" ON "StaffTeam"("clientId", "key");

-- CreateIndex
CREATE UNIQUE INDEX "TeamHuddle_teamId_date_key" ON "TeamHuddle"("teamId", "date");

-- CreateIndex
CREATE INDEX "Objective_clientId_quarter_idx" ON "Objective"("clientId", "quarter");

-- CreateIndex
CREATE INDEX "KeyResult_objectiveId_idx" ON "KeyResult"("objectiveId");

-- CreateIndex
CREATE INDEX "KeyResultCheckIn_keyResultId_createdAt_idx" ON "KeyResultCheckIn"("keyResultId", "createdAt");

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "StaffTeam"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTeam" ADD CONSTRAINT "StaffTeam_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffTeam" ADD CONSTRAINT "StaffTeam_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamHuddle" ADD CONSTRAINT "TeamHuddle_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "StaffTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TeamHuddle" ADD CONSTRAINT "TeamHuddle_ledById_fkey" FOREIGN KEY ("ledById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "StaffTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Objective"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Objective" ADD CONSTRAINT "Objective_agreedById_fkey" FOREIGN KEY ("agreedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResult" ADD CONSTRAINT "KeyResult_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "Objective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultCheckIn" ADD CONSTRAINT "KeyResultCheckIn_keyResultId_fkey" FOREIGN KEY ("keyResultId") REFERENCES "KeyResult"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyResultCheckIn" ADD CONSTRAINT "KeyResultCheckIn_byId_fkey" FOREIGN KEY ("byId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Row level security, like every other public table.
ALTER TABLE public."StaffTeam" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TeamHuddle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Objective" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KeyResult" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."KeyResultCheckIn" ENABLE ROW LEVEL SECURITY;

-- CreateTable
CREATE TABLE "TariffFix" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "doneAt" TIMESTAMP(3),
    "doneById" TEXT,
    "doneNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TariffFix_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "TariffFix_clientId_code_key" ON "TariffFix"("clientId", "code");
ALTER TABLE "TariffFix" ADD CONSTRAINT "TariffFix_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TariffFix" ADD CONSTRAINT "TariffFix_doneById_fkey" FOREIGN KEY ("doneById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE public."TariffFix" ENABLE ROW LEVEL SECURITY;
