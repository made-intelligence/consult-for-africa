-- A client's own staff, as against a CFA consultant (User) or a client's
-- commercial contact (ClientContact). Built for the Haven staff app but keyed
-- on clientId rather than hardcoded, because every transformation engagement
-- needs the same thing and the second one should not need a second table.
--
-- Additive only. Client gains no column: the relation is held on StaffMember.
--
-- No password column anywhere, by design. Nineteen people on personal email,
-- mostly reaching this on a phone mid-shift, and nobody at the hospital whose
-- job is administering resets. Sign-in is a single-use link, and only the hash
-- of that link's token is stored, so a leaked table cannot be used to sign in.

-- CreateEnum
CREATE TYPE "StaffTier" AS ENUM ('ALL_STAFF', 'SUPERVISOR', 'LEADERSHIP');

-- CreateTable
CREATE TABLE "StaffMember" (
    "id" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "department" TEXT NOT NULL,
    "position" TEXT NOT NULL,
    "tier" "StaffTier" NOT NULL DEFAULT 'ALL_STAFF',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StaffMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StaffLoginToken" (
    "id" TEXT NOT NULL,
    "staffId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "usedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StaffLoginToken_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "StaffMember_clientId_email_key" ON "StaffMember"("clientId", "email");

-- CreateIndex
CREATE INDEX "StaffMember_clientId_isActive_idx" ON "StaffMember"("clientId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "StaffLoginToken_tokenHash_key" ON "StaffLoginToken"("tokenHash");

-- CreateIndex
CREATE INDEX "StaffLoginToken_staffId_idx" ON "StaffLoginToken"("staffId");

-- CreateIndex
CREATE INDEX "StaffLoginToken_expiresAt_idx" ON "StaffLoginToken"("expiresAt");

-- AddForeignKey
ALTER TABLE "StaffMember" ADD CONSTRAINT "StaffMember_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StaffLoginToken" ADD CONSTRAINT "StaffLoginToken_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "StaffMember"("id") ON DELETE CASCADE ON UPDATE CASCADE;
