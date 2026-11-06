-- CreateEnum
CREATE TYPE "PersonalObjectiveStatus" AS ENUM ('DRAFT', 'PROPOSED', 'AGREED');

-- CreateEnum
CREATE TYPE "Rag" AS ENUM ('GREEN', 'AMBER', 'RED');

-- CreateEnum
CREATE TYPE "AppraisalStage" AS ENUM ('SELF', 'MANAGER', 'MODERATION', 'SIGN_OFF', 'DONE');

-- AlterTable
ALTER TABLE "StaffMember" ADD COLUMN     "lineManagerId" TEXT,
ADD COLUMN     "roleCode" TEXT;

-- CreateTable
CREATE TABLE "ReviewCycle" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3) NOT NULL,
    "appraisalOpenedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReviewCycle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalObjective" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "kpiCode" TEXT,
    "title" TEXT NOT NULL,
    "target" TEXT NOT NULL,
    "tags" TEXT[],
    "weight" DOUBLE PRECISION NOT NULL DEFAULT 0.2,
    "status" "PersonalObjectiveStatus" NOT NULL DEFAULT 'DRAFT',
    "agreedById" TEXT,
    "agreedAt" TIMESTAMP(3),
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalObjective_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ObjectiveUpdate" (
    "id" TEXT NOT NULL,
    "objectiveId" TEXT NOT NULL,
    "month" TEXT NOT NULL,
    "actual" TEXT NOT NULL,
    "rag" "Rag" NOT NULL,
    "note" TEXT,
    "byId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ObjectiveUpdate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OneToOne" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "managerId" TEXT,
    "heldOn" TIMESTAMP(3) NOT NULL,
    "wentWell" TEXT,
    "inTheWay" TEXT,
    "support" TEXT,
    "actions" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "OneToOne_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Appraisal" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "cycleId" TEXT NOT NULL,
    "stage" "AppraisalStage" NOT NULL DEFAULT 'SELF',
    "selfScores" JSONB,
    "managerScores" JSONB,
    "conductSelf" JSONB,
    "conductManager" JSONB,
    "selfComment" TEXT,
    "managerComment" TEXT,
    "managerId" TEXT,
    "moderationNote" TEXT,
    "overall" DOUBLE PRECISION,
    "staffSignedAt" TIMESTAMP(3),
    "managerSignedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Appraisal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ReviewCycle_clientId_idx" ON "ReviewCycle"("clientId");

-- CreateIndex
CREATE INDEX "PersonalObjective_staffId_cycleId_idx" ON "PersonalObjective"("staffId", "cycleId");

-- CreateIndex
CREATE UNIQUE INDEX "ObjectiveUpdate_objectiveId_month_key" ON "ObjectiveUpdate"("objectiveId", "month");

-- CreateIndex
CREATE INDEX "OneToOne_staffId_heldOn_idx" ON "OneToOne"("staffId", "heldOn");

-- CreateIndex
CREATE UNIQUE INDEX "Appraisal_staffId_cycleId_key" ON "Appraisal"("staffId", "cycleId");

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_lineManagerId_fkey" FOREIGN KEY ("lineManagerId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReviewCycle" ADD CONSTRAINT "ReviewCycle_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalObjective" ADD CONSTRAINT "PersonalObjective_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalObjective" ADD CONSTRAINT "PersonalObjective_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ReviewCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PersonalObjective" ADD CONSTRAINT "PersonalObjective_agreedById_fkey" FOREIGN KEY ("agreedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveUpdate" ADD CONSTRAINT "ObjectiveUpdate_objectiveId_fkey" FOREIGN KEY ("objectiveId") REFERENCES "PersonalObjective"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ObjectiveUpdate" ADD CONSTRAINT "ObjectiveUpdate_byId_fkey" FOREIGN KEY ("byId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOne" ADD CONSTRAINT "OneToOne_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OneToOne" ADD CONSTRAINT "OneToOne_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_cycleId_fkey" FOREIGN KEY ("cycleId") REFERENCES "ReviewCycle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Appraisal" ADD CONSTRAINT "Appraisal_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;


-- Row level security, like every other public table.
ALTER TABLE public."ReviewCycle" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PersonalObjective" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."ObjectiveUpdate" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."OneToOne" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Appraisal" ENABLE ROW LEVEL SECURITY;
