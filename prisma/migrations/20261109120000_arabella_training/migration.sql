-- Training in trickles: a module reaches staff from its week's Monday. Null = live now,
-- which is every Haven module, so Haven is unchanged.
ALTER TABLE "Protocol" ADD COLUMN "startsOn" TIMESTAMP(3);

-- The approver returned the module with a note (approvalNote) instead of approving it.
ALTER TABLE "Protocol" ADD COLUMN "sentBackAt" TIMESTAMP(3);
