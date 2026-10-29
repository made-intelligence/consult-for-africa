-- One measure, one week, one number, and what moved it.
--
-- The system is meant to produce a measurable improvement every week. It cannot
-- until something is counted every week, and today nothing at Haven is. Six
-- measures entered by hand beats sixty instrumented next quarter.
--
-- movedBy is the point. A number that changes and nobody can say why teaches a
-- team that the scoreboard is weather. A number with "we fixed the reorder
-- point on the fast movers" against it teaches them it is theirs.
--
-- value is text on purpose: some measures are counts, some are percentages and
-- one is a streak. Forcing them into a numeric column would impose one shape on
-- six things that do not share one.

-- CreateTable
CREATE TABLE "ScoreboardEntry" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "measure" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "movedBy" TEXT,
    "enteredById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScoreboardEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ScoreboardEntry_clientId_measure_period_key" ON "ScoreboardEntry"("clientId", "measure", "period");
CREATE INDEX "ScoreboardEntry_clientId_period_idx" ON "ScoreboardEntry"("clientId", "period");

-- AddForeignKey
ALTER TABLE "ScoreboardEntry" ADD CONSTRAINT "ScoreboardEntry_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ScoreboardEntry" ADD CONSTRAINT "ScoreboardEntry_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;
