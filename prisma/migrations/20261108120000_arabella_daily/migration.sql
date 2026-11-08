-- Arabella daily view: one row per area per day, and decisions waiting on the principal.
-- Hand-written. Apply with `prisma migrate deploy` only.

-- CreateEnum
CREATE TYPE "DecisionRequestStatus" AS ENUM ('OPEN', 'DECIDED', 'DECLINED', 'WITHDRAWN');

-- CreateTable
CREATE TABLE "DailyReturn" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "day" DATE NOT NULL,
    "section" TEXT NOT NULL,
    "enteredById" TEXT,
    "values" JSONB NOT NULL,
    "note" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DailyReturn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DecisionRequest" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "detail" TEXT,
    "raisedById" TEXT,
    "raisedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "neededBy" TIMESTAMP(3),
    "status" "DecisionRequestStatus" NOT NULL DEFAULT 'OPEN',
    "decidedById" TEXT,
    "decidedAt" TIMESTAMP(3),
    "decision" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DecisionRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "DailyReturn_clientId_day_section_key" ON "DailyReturn"("clientId", "day", "section");

-- CreateIndex
CREATE INDEX "DailyReturn_clientId_day_idx" ON "DailyReturn"("clientId", "day");

-- CreateIndex
CREATE INDEX "DecisionRequest_clientId_status_idx" ON "DecisionRequest"("clientId", "status");

-- AddForeignKey
ALTER TABLE "DailyReturn" ADD CONSTRAINT "DailyReturn_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DailyReturn" ADD CONSTRAINT "DailyReturn_enteredById_fkey" FOREIGN KEY ("enteredById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRequest" ADD CONSTRAINT "DecisionRequest_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRequest" ADD CONSTRAINT "DecisionRequest_raisedById_fkey" FOREIGN KEY ("raisedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DecisionRequest" ADD CONSTRAINT "DecisionRequest_decidedById_fkey" FOREIGN KEY ("decidedById") REFERENCES "StaffMember"("id") ON DELETE SET NULL ON UPDATE CASCADE;

ALTER TABLE public."DailyReturn" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."DecisionRequest" ENABLE ROW LEVEL SECURITY;
