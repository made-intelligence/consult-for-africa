-- Meetings move from Google Meet to Daily rooms on Mezo's Daily domain.
--
-- Daily transcribes the call, a cron collects the transcript, and Claude drafts
-- the commitments it heard. The drafts wait on the meeting until the office
-- confirms them, so these are additive and nullable: every existing meeting is
-- untouched.

ALTER TABLE "Meeting" ADD COLUMN "dailyRoomName" TEXT;
ALTER TABLE "Meeting" ADD COLUMN "aiCommitments" JSONB;
ALTER TABLE "Meeting" ADD COLUMN "commitmentsReviewedAt" TIMESTAMP(3);
ALTER TABLE "Meeting" ADD COLUMN "commitmentsReviewedById" TEXT;

CREATE UNIQUE INDEX "Meeting_dailyRoomName_key" ON "Meeting"("dailyRoomName");
