-- The paid consultation replaces the free discovery call.

ALTER TYPE "LyfeIntent" ADD VALUE IF NOT EXISTS 'CONSULTATION';

ALTER TABLE "LyfeEnquiry" ADD COLUMN "slotAt" TIMESTAMP(3);
ALTER TABLE "LyfeEnquiry" ADD COLUMN "paymentRef" TEXT;
ALTER TABLE "LyfeEnquiry" ADD COLUMN "paidAt" TIMESTAMP(3);
ALTER TABLE "LyfeEnquiry" ADD COLUMN "amountKobo" INTEGER;

CREATE UNIQUE INDEX "LyfeEnquiry_paymentRef_key" ON "LyfeEnquiry"("paymentRef");
CREATE INDEX "LyfeEnquiry_slotAt_idx" ON "LyfeEnquiry"("slotAt");

-- Two people must not be able to buy the same half hour. Only paid rows hold
-- the diary, so unpaid attempts on the same slot stay allowed and simply lose
-- the race.
CREATE UNIQUE INDEX "LyfeEnquiry_slotAt_paid_key"
  ON "LyfeEnquiry"("slotAt") WHERE "paidAt" IS NOT NULL;
