-- CreateTable
CREATE TABLE "SurveyClosure" (
    "id" TEXT NOT NULL,
    "survey" TEXT NOT NULL,
    "closedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closedById" TEXT,
    "frozenCount" INTEGER NOT NULL,
    "note" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SurveyClosure_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SurveyClosure_survey_key" ON "SurveyClosure"("survey");

-- CreateIndex
CREATE INDEX "SurveyClosure_closedAt_idx" ON "SurveyClosure"("closedAt");

-- AddForeignKey
ALTER TABLE "SurveyClosure" ADD CONSTRAINT "SurveyClosure_closedById_fkey" FOREIGN KEY ("closedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
