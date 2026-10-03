-- Lyfe Plastics and Dermatology: the enquiry record behind /lyfe.
-- Additive only. No existing table is altered except User, which gains no
-- column (the relation is held on LyfeEnquiry).

-- CreateEnum
CREATE TYPE "LyfeIntent" AS ENUM ('EVENT_RSVP', 'DISCOVERY_CALL');

-- CreateEnum
CREATE TYPE "LyfePathway" AS ENUM ('AESTHETIC', 'SURGICAL', 'UNSURE');

-- CreateEnum
CREATE TYPE "LyfeConcern" AS ENUM ('BODY_AFTER_CHILDREN', 'BREAST', 'FACE_AND_AGEING', 'SKIN_AND_TONE', 'SCARS_AND_KELOIDS', 'BODY_CONTOUR', 'HAIR', 'WELLNESS_AND_WEIGHT', 'NOT_SURE_YET');

-- CreateEnum
CREATE TYPE "LyfeTiming" AS ENUM ('AS_SOON_AS_POSSIBLE', 'WITHIN_3_MONTHS', 'WITHIN_12_MONTHS', 'RESEARCHING');

-- CreateEnum
CREATE TYPE "LyfeBased" AS ENUM ('LAGOS', 'ABUJA', 'ELSEWHERE_NIGERIA', 'OUTSIDE_NIGERIA');

-- CreateEnum
CREATE TYPE "LyfeFormat" AS ENUM ('IN_PERSON', 'VIRTUAL', 'EITHER');

-- CreateEnum
CREATE TYPE "LyfeNicotine" AS ENUM ('NEVER', 'STOPPED_OVER_A_YEAR_AGO', 'STOPPED_RECENTLY', 'CURRENT', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "LyfeWeightTrend" AS ENUM ('STABLE', 'LOSING_NOW', 'PLANNING_TO_LOSE', 'PREFER_NOT_TO_SAY');

-- CreateEnum
CREATE TYPE "LyfeSource" AS ENUM ('INSTAGRAM', 'TIKTOK', 'GOOGLE', 'WHATSAPP_FORWARD', 'FRIEND_OR_FAMILY', 'A_DOCTOR', 'AN_EVENT', 'PRESS_OR_PODCAST', 'FLYER_OR_QR', 'REACTIVATION', 'OTHER');

-- CreateEnum
CREATE TYPE "LyfeStatus" AS ENUM ('NEW', 'CONTACTED', 'BOOKED', 'ATTENDED', 'CONVERTED', 'FOLLOW_UP_LATER', 'UNREACHABLE', 'NOT_PROCEEDING');

-- CreateTable
CREATE TABLE "LyfeEnquiry" (
    "id" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "intent" "LyfeIntent" NOT NULL DEFAULT 'DISCOVERY_CALL',
    "guestCount" INTEGER,
    "isClinician" BOOLEAN,
    "pathway" "LyfePathway" NOT NULL DEFAULT 'UNSURE',
    "concerns" "LyfeConcern"[],
    "timing" "LyfeTiming",
    "based" "LyfeBased" NOT NULL DEFAULT 'LAGOS',
    "travelFrom" TEXT,
    "format" "LyfeFormat" NOT NULL DEFAULT 'IN_PERSON',
    "heightReported" TEXT,
    "weightReported" TEXT,
    "nicotine" "LyfeNicotine",
    "weightTrend" "LyfeWeightTrend",
    "priorSurgery" BOOLEAN,
    "goal" TEXT,
    "notes" TEXT,
    "source" "LyfeSource" NOT NULL DEFAULT 'OTHER',
    "sourceDetail" TEXT,
    "utmSource" TEXT,
    "utmMedium" TEXT,
    "utmCampaign" TEXT,
    "sourcePath" TEXT,
    "status" "LyfeStatus" NOT NULL DEFAULT 'NEW',
    "firstContactedAt" TIMESTAMP(3),
    "lastContactedAt" TIMESTAMP(3),
    "contactAttempts" INTEGER NOT NULL DEFAULT 0,
    "nextActionAt" TIMESTAMP(3),
    "nextAction" TEXT,
    "coordinatorNotes" TEXT,
    "ownerId" TEXT,
    "consentedAt" TIMESTAMP(3) NOT NULL,
    "consentText" TEXT NOT NULL,
    "ipHash" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LyfeEnquiry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LyfeEnquiry_status_createdAt_idx" ON "LyfeEnquiry"("status", "createdAt");

-- CreateIndex
CREATE INDEX "LyfeEnquiry_intent_status_idx" ON "LyfeEnquiry"("intent", "status");

-- CreateIndex
CREATE INDEX "LyfeEnquiry_pathway_status_idx" ON "LyfeEnquiry"("pathway", "status");

-- CreateIndex
CREATE INDEX "LyfeEnquiry_email_idx" ON "LyfeEnquiry"("email");

-- CreateIndex
CREATE INDEX "LyfeEnquiry_nextActionAt_idx" ON "LyfeEnquiry"("nextActionAt");

-- AddForeignKey
ALTER TABLE "LyfeEnquiry" ADD CONSTRAINT "LyfeEnquiry_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
