-- Market Watch: social listening and market intelligence for a client's brand
-- and its competitors. Additive only: new tables and enums, no existing table
-- is altered.

-- CreateEnum
CREATE TYPE "MarketWatchStatus" AS ENUM ('ACTIVE', 'PAUSED');

-- CreateEnum
CREATE TYPE "WatchEntityRole" AS ENUM ('OWN', 'COMPETITOR');

-- CreateEnum
CREATE TYPE "WatchSource" AS ENUM ('GOOGLE_REVIEW', 'NEWS', 'X', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'YOUTUBE', 'REDDIT', 'NAIRALAND', 'WEB', 'WEBSITE_CHANGE', 'SEARCH_INTEREST');

-- CreateEnum
CREATE TYPE "WatchSentiment" AS ENUM ('POSITIVE', 'NEUTRAL', 'NEGATIVE', 'MIXED');

-- CreateEnum
CREATE TYPE "WatchAlertKind" AS ENUM ('NEGATIVE_REVIEW', 'NEGATIVE_MENTION', 'SPIKE', 'RISK', 'LEAD', 'COMPETITOR_MOVE');

-- CreateTable
CREATE TABLE "MarketWatch" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "clientId" TEXT,
    "engagementId" TEXT,
    "status" "MarketWatchStatus" NOT NULL DEFAULT 'ACTIVE',
    "sector" TEXT NOT NULL DEFAULT 'healthcare',
    "context" TEXT,
    "alertEmails" TEXT[],
    "lastRunAt" TIMESTAMP(3),
    "createdById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MarketWatch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchEntity" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "WatchEntityRole" NOT NULL DEFAULT 'COMPETITOR',
    "keywords" TEXT[],
    "excludes" TEXT[],
    "googlePlaceId" TEXT,
    "googleCid" TEXT,
    "instagramHandle" TEXT,
    "tiktokHandle" TEXT,
    "xHandle" TEXT,
    "facebookPage" TEXT,
    "youtubeChannel" TEXT,
    "website" TEXT,
    "awarioAlertId" TEXT,
    "trackedUrls" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchEntity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchMention" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "entityId" TEXT,
    "source" "WatchSource" NOT NULL,
    "externalId" TEXT NOT NULL,
    "url" TEXT,
    "authorName" TEXT,
    "authorHandle" TEXT,
    "authorFollowers" INTEGER,
    "title" TEXT,
    "text" TEXT NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "rating" INTEGER,
    "likes" INTEGER,
    "comments" INTEGER,
    "shares" INTEGER,
    "views" INTEGER,
    "ownerReply" TEXT,
    "ownerRepliedAt" TIMESTAMP(3),
    "raw" JSONB,
    "classifiedAt" TIMESTAMP(3),
    "relevant" BOOLEAN,
    "sentiment" "WatchSentiment",
    "sentimentScore" DOUBLE PRECISION,
    "aspects" TEXT[],
    "isLead" BOOLEAN NOT NULL DEFAULT false,
    "isComplaint" BOOLEAN NOT NULL DEFAULT false,
    "isRisk" BOOLEAN NOT NULL DEFAULT false,
    "language" TEXT,
    "summary" TEXT,
    "replyDraft" TEXT,
    "correctedBy" TEXT,
    "starred" BOOLEAN NOT NULL DEFAULT false,
    "handledAt" TIMESTAMP(3),
    "handledBy" TEXT,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WatchMention_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchMetric" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "metric" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "source" "WatchSource",

    CONSTRAINT "WatchMetric_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchPageSnapshot" (
    "id" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "hash" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchPageSnapshot_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchAlert" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "mentionId" TEXT,
    "kind" "WatchAlertKind" NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT NOT NULL,
    "dedupeKey" TEXT NOT NULL,
    "emailedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "acknowledgedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WatchAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WatchRun" (
    "id" TEXT NOT NULL,
    "watchId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "fetched" INTEGER NOT NULL DEFAULT 0,
    "inserted" INTEGER NOT NULL DEFAULT 0,
    "skipped" TEXT,
    "error" TEXT,
    "pendingRef" TEXT,
    "pendingEntityId" TEXT,
    "collectedAt" TIMESTAMP(3),

    CONSTRAINT "WatchRun_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MarketWatch_status_idx" ON "MarketWatch"("status");

-- CreateIndex
CREATE INDEX "WatchEntity_watchId_idx" ON "WatchEntity"("watchId");

-- CreateIndex
CREATE INDEX "WatchMention_watchId_publishedAt_idx" ON "WatchMention"("watchId", "publishedAt");

-- CreateIndex
CREATE INDEX "WatchMention_watchId_classifiedAt_idx" ON "WatchMention"("watchId", "classifiedAt");

-- CreateIndex
CREATE INDEX "WatchMention_entityId_publishedAt_idx" ON "WatchMention"("entityId", "publishedAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchMention_watchId_source_externalId_key" ON "WatchMention"("watchId", "source", "externalId");

-- CreateIndex
CREATE INDEX "WatchMetric_watchId_metric_date_idx" ON "WatchMetric"("watchId", "metric", "date");

-- CreateIndex
CREATE UNIQUE INDEX "WatchMetric_entityId_metric_date_key" ON "WatchMetric"("entityId", "metric", "date");

-- CreateIndex
CREATE INDEX "WatchPageSnapshot_entityId_url_fetchedAt_idx" ON "WatchPageSnapshot"("entityId", "url", "fetchedAt");

-- CreateIndex
CREATE INDEX "WatchAlert_watchId_createdAt_idx" ON "WatchAlert"("watchId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "WatchAlert_watchId_dedupeKey_key" ON "WatchAlert"("watchId", "dedupeKey");

-- CreateIndex
CREATE INDEX "WatchRun_watchId_startedAt_idx" ON "WatchRun"("watchId", "startedAt");

-- CreateIndex
CREATE INDEX "WatchRun_pendingRef_collectedAt_idx" ON "WatchRun"("pendingRef", "collectedAt");

-- AddForeignKey
ALTER TABLE "MarketWatch" ADD CONSTRAINT "MarketWatch_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MarketWatch" ADD CONSTRAINT "MarketWatch_engagementId_fkey" FOREIGN KEY ("engagementId") REFERENCES "Project"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchEntity" ADD CONSTRAINT "WatchEntity_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "MarketWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchMention" ADD CONSTRAINT "WatchMention_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "MarketWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchMention" ADD CONSTRAINT "WatchMention_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WatchEntity"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchMetric" ADD CONSTRAINT "WatchMetric_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "MarketWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchMetric" ADD CONSTRAINT "WatchMetric_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WatchEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchPageSnapshot" ADD CONSTRAINT "WatchPageSnapshot_entityId_fkey" FOREIGN KEY ("entityId") REFERENCES "WatchEntity"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchAlert" ADD CONSTRAINT "WatchAlert_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "MarketWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchAlert" ADD CONSTRAINT "WatchAlert_mentionId_fkey" FOREIGN KEY ("mentionId") REFERENCES "WatchMention"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WatchRun" ADD CONSTRAINT "WatchRun_watchId_fkey" FOREIGN KEY ("watchId") REFERENCES "MarketWatch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

