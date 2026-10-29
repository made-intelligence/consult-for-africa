-- The evening holds seventy. One-step RSVP could not express that, because a
-- person saying "I would like to come" and a person holding a place are not
-- the same person. Interest is now open, invitations are chosen, and only a
-- confirmation against a personal token fills a seat.

CREATE TYPE "LyfeEventStage" AS ENUM (
  'INTERESTED', 'INVITED', 'CONFIRMED', 'DECLINED', 'WAITLIST', 'ATTENDED', 'NO_SHOW'
);

ALTER TABLE "LyfeEnquiry"
  ADD COLUMN "eventStage"  "LyfeEventStage",
  ADD COLUMN "inviteToken" TEXT,
  ADD COLUMN "invitedAt"   TIMESTAMP(3),
  ADD COLUMN "confirmedAt" TIMESTAMP(3),
  ADD COLUMN "declinedAt"  TIMESTAMP(3);

CREATE UNIQUE INDEX "LyfeEnquiry_inviteToken_key" ON "LyfeEnquiry"("inviteToken");
CREATE INDEX "LyfeEnquiry_eventStage_createdAt_idx" ON "LyfeEnquiry"("eventStage", "createdAt");

-- Anyone who used the old one-step form asked to come but was never chosen,
-- so they start where everybody else now starts.
UPDATE "LyfeEnquiry"
   SET "eventStage" = 'INTERESTED'
 WHERE "intent" = 'EVENT_RSVP' AND "eventStage" IS NULL;
