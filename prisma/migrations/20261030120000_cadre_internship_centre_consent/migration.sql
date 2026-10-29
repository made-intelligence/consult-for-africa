-- AlterTable
ALTER TABLE "CadreInternshipCentre" ADD COLUMN     "claimToken" TEXT,
ADD COLUMN     "consentAt" TIMESTAMP(3),
ADD COLUMN     "consentById" TEXT,
ADD COLUMN     "consentName" TEXT,
ADD COLUMN     "consentNote" TEXT,
ADD COLUMN     "consentRole" TEXT,
ADD COLUMN     "consentSource" TEXT,
ADD COLUMN     "listed" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE UNIQUE INDEX "CadreInternshipCentre_claimToken_key" ON "CadreInternshipCentre"("claimToken");

-- CreateIndex
CREATE INDEX "CadreInternshipCentre_listed_idx" ON "CadreInternshipCentre"("listed");
