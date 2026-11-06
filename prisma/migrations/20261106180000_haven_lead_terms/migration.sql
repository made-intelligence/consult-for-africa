-- CreateTable
CREATE TABLE "LeadTerm" (
    "id" TEXT NOT NULL,
    "teamId" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "endsOn" TIMESTAMP(3) NOT NULL,
    "handoverNote" TEXT,
    "grantedSupervisor" BOOLEAN NOT NULL DEFAULT false,
    "endedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LeadTerm_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "LeadTerm_teamId_startsOn_idx" ON "LeadTerm"("teamId", "startsOn");

-- AddForeignKey
ALTER TABLE "LeadTerm" ADD CONSTRAINT "LeadTerm_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "StaffTeam"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadTerm" ADD CONSTRAINT "LeadTerm_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;


ALTER TABLE public."LeadTerm" ENABLE ROW LEVEL SECURITY;
