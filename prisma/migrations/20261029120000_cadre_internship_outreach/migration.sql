-- CreateTable
CREATE TABLE "CadreInternshipOutreach" (
    "id" TEXT NOT NULL,
    "centreId" TEXT,
    "direction" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "template" TEXT,
    "status" TEXT NOT NULL,
    "error" TEXT,
    "sentById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CadreInternshipOutreach_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CadreInternshipOutreach_centreId_createdAt_idx" ON "CadreInternshipOutreach"("centreId", "createdAt");

-- CreateIndex
CREATE INDEX "CadreInternshipOutreach_direction_createdAt_idx" ON "CadreInternshipOutreach"("direction", "createdAt");

-- AddForeignKey
ALTER TABLE "CadreInternshipOutreach" ADD CONSTRAINT "CadreInternshipOutreach_centreId_fkey" FOREIGN KEY ("centreId") REFERENCES "CadreInternshipCentre"("id") ON DELETE SET NULL ON UPDATE CASCADE;
