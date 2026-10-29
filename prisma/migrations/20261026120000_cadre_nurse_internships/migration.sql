-- Nurse internship placement on CadreHealth.
--
-- Approved centres and our engagement with each, the applications, each
-- applicant's ranked choice of centre, and the one sitting of the assessment.
-- New tables only: nothing existing is altered.

-- CreateEnum
CREATE TYPE "CadreInternshipCentreStage" AS ENUM ('PROSPECT', 'CONTACTED', 'MEETING', 'COMMITTED', 'DECLINED');

-- CreateEnum
CREATE TYPE "CadreInternshipStatus" AS ENUM ('APPLIED', 'ASSESSED', 'PLACED', 'WITHDRAWN');

-- CreateEnum
CREATE TYPE "CadreInternshipMatchStatus" AS ENUM ('PENDING', 'INVITED', 'OFFERED', 'ACCEPTED', 'DECLINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "CadreInternshipCentre" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "area" TEXT,
    "ownership" TEXT,
    "stage" "CadreInternshipCentreStage" NOT NULL DEFAULT 'PROSPECT',
    "ownerUserId" TEXT,
    "contactName" TEXT,
    "contactRole" TEXT,
    "contactEmail" TEXT,
    "contactPhone" TEXT,
    "nextAction" TEXT,
    "nextActionDue" TIMESTAMP(3),
    "notes" TEXT,
    "slotsOffered" INTEGER,
    "minScore" INTEGER,
    "intakeNote" TEXT,
    "committedAt" TIMESTAMP(3),
    "employerOrgId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreInternshipCentre_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadreInternshipApplication" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "intake" TEXT NOT NULL,
    "qualification" TEXT NOT NULL,
    "school" TEXT NOT NULL,
    "graduationYear" INTEGER NOT NULL,
    "nmcnNumber" TEXT,
    "phone" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "consentAt" TIMESTAMP(3) NOT NULL,
    "status" "CadreInternshipStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreInternshipApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadreInternshipPreference" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "centreId" TEXT NOT NULL,
    "rank" INTEGER NOT NULL,
    "status" "CadreInternshipMatchStatus" NOT NULL DEFAULT 'PENDING',
    "decidedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreInternshipPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CadreInternshipAttempt" (
    "id" TEXT NOT NULL,
    "applicationId" TEXT NOT NULL,
    "bankVersion" TEXT NOT NULL,
    "paper" JSONB NOT NULL,
    "answers" JSONB NOT NULL DEFAULT '{}',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deadlineAt" TIMESTAMP(3) NOT NULL,
    "submittedAt" TIMESTAMP(3),
    "score" INTEGER,
    "sectionScores" JSONB,

    CONSTRAINT "CadreInternshipAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipCentre_slug_key" ON "CadreInternshipCentre"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipCentre_employerOrgId_key" ON "CadreInternshipCentre"("employerOrgId");

-- CreateIndex
CREATE INDEX "CadreInternshipCentre_stage_idx" ON "CadreInternshipCentre"("stage");

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipApplication_accessToken_key" ON "CadreInternshipApplication"("accessToken");

-- CreateIndex
CREATE INDEX "CadreInternshipApplication_intake_status_idx" ON "CadreInternshipApplication"("intake", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipApplication_professionalId_intake_key" ON "CadreInternshipApplication"("professionalId", "intake");

-- CreateIndex
CREATE INDEX "CadreInternshipPreference_centreId_status_idx" ON "CadreInternshipPreference"("centreId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipPreference_applicationId_centreId_key" ON "CadreInternshipPreference"("applicationId", "centreId");

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipAttempt_applicationId_key" ON "CadreInternshipAttempt"("applicationId");

-- AddForeignKey
ALTER TABLE "CadreInternshipCentre" ADD CONSTRAINT "CadreInternshipCentre_employerOrgId_fkey" FOREIGN KEY ("employerOrgId") REFERENCES "CadreEmployerOrg"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadreInternshipApplication" ADD CONSTRAINT "CadreInternshipApplication_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "CadreProfessional"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadreInternshipPreference" ADD CONSTRAINT "CadreInternshipPreference_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CadreInternshipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadreInternshipPreference" ADD CONSTRAINT "CadreInternshipPreference_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "CadreInternshipCentre"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CadreInternshipAttempt" ADD CONSTRAINT "CadreInternshipAttempt_applicationId_fkey" FOREIGN KEY ("applicationId") REFERENCES "CadreInternshipApplication"("id") ON DELETE CASCADE ON UPDATE CASCADE;

