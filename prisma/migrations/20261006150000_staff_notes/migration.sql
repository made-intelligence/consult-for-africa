-- Team notes: how colleagues co-work here.
--
-- Visible rather than private. Direct messages would make this a worse
-- WhatsApp, which these nineteen already have and will not leave. A note to a
-- department or to the whole hospital is a different thing: it is how a shift
-- tells the next shift something, how somebody asks for cover, and how we close
-- the loop by saying what changed because people spoke up.
--
-- Visibility is also the safeguard, because the risk in a hospital is patient
-- detail being typed somewhere that is not the clinical record.
--
-- Additive only.

-- CreateEnum
CREATE TYPE "StaffNoteScope" AS ENUM ('DEPARTMENT', 'ALL');

-- CreateTable
CREATE TABLE "StaffNote" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "authorId" TEXT NOT NULL,
    "scope" "StaffNoteScope" NOT NULL DEFAULT 'DEPARTMENT',
    "department" TEXT,
    "body" TEXT NOT NULL,
    "parentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffNote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StaffNote_clientId_createdAt_idx" ON "StaffNote"("clientId", "createdAt");

-- CreateIndex
CREATE INDEX "StaffNote_parentId_idx" ON "StaffNote"("parentId");

-- AddForeignKey
ALTER TABLE "StaffNote" ADD CONSTRAINT "StaffNote_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNote" ADD CONSTRAINT "StaffNote_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffNote" ADD CONSTRAINT "StaffNote_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "StaffNote"("id") ON DELETE CASCADE ON UPDATE CASCADE;
