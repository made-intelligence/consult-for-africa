-- CreateEnum
CREATE TYPE "EngagementDashboardStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "EngagementDashboard" (
    "id" TEXT NOT NULL,
    "engagementId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "asOf" TIMESTAMP(3) NOT NULL,
    "data" JSONB NOT NULL,
    "status" "EngagementDashboardStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "publishedBy" TEXT,
    "source" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EngagementDashboard_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "EngagementDashboard_engagementId_status_idx" ON "EngagementDashboard"("engagementId", "status");

-- AddForeignKey
ALTER TABLE "EngagementDashboard" ADD CONSTRAINT "EngagementDashboard_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
