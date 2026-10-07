-- A second person agrees the weekly numbers.
--
-- "Agreed", not "verified" or "vetted". Those are words for policing, and the
-- whole programme rests on people feeling able to speak up; the register of a
-- control matters as much as the control. This is two people looking at the
-- same figure and agreeing it, which is also what happens in the room.
--
-- A number nobody agreed is whatever the person who typed it says it is, and
-- these go to the board and get used to argue the hospital is improving.
--
-- It cannot be the person who entered it. Enforced in the route: comparing two
-- columns in a check constraint is more trouble than it is worth, and the
-- session is already there.
--
-- Deliberately NOT applied to task completions. Countersigning every handover
-- tick across nineteen people makes the system unusable, and the first thing
-- that happens is that people stop ticking. Those are sampled by a human.

ALTER TABLE "ScoreboardEntry" ADD COLUMN "agreedById" TEXT;
ALTER TABLE "ScoreboardEntry" ADD COLUMN "agreedAt" TIMESTAMP(3);
ALTER TABLE "ScoreboardEntry" ADD COLUMN "agreedNote" TEXT;

ALTER TABLE "ScoreboardEntry" ADD CONSTRAINT "ScoreboardEntry_agreedById_fkey" FOREIGN KEY ("agreedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE INDEX "ScoreboardEntry_clientId_agreedAt_idx" ON "ScoreboardEntry"("clientId", "agreedAt");
