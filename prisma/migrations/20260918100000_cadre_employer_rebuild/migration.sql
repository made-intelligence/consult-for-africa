-- The employer side gets a real tenancy boundary, a consent record for contact,
-- and the distinction between someone who applied and someone we surfaced.
--
-- Before this, a role was scoped by comparing the mandate's facilityName text to
-- the session's companyName text, so two accounts that typed the same hospital
-- name saw each other's roles and applicants. None of the four live accounts had
-- a facility, so all four were scoped that way.

-- CreateEnum
CREATE TYPE "CadreEmployerRole" AS ENUM ('OWNER', 'RECRUITER', 'VIEWER');

-- CreateEnum
CREATE TYPE "CadreContactRequestStatus" AS ENUM ('PENDING', 'ACCEPTED', 'DECLINED', 'EXPIRED');

-- CreateEnum
CREATE TYPE "CadreMatchSource" AS ENUM ('APPLIED', 'SOURCED', 'INVITED');

-- CreateTable: the hiring organisation, and the subject of verification
CREATE TABLE "CadreEmployerOrg" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "facilityId" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "verifiedAt" TIMESTAMP(3),
    "verifiedById" TEXT,
    "verifiedNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreEmployerOrg_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CadreEmployerOrg_facilityId_key" ON "CadreEmployerOrg"("facilityId");
CREATE INDEX "CadreEmployerOrg_isVerified_idx" ON "CadreEmployerOrg"("isVerified");

ALTER TABLE "CadreEmployerOrg" ADD CONSTRAINT "CadreEmployerOrg_facilityId_fkey"
  FOREIGN KEY ("facilityId") REFERENCES "CadreFacility"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CadreEmployerOrg" ADD CONSTRAINT "CadreEmployerOrg_verifiedById_fkey"
  FOREIGN KEY ("verifiedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Backfill: one org per distinct company name, not one per login.
--
-- This matters for a live case. "Novessence Aesthetic Clinic" is registered
-- twice, on two emails, 74 seconds apart. Under the old tenancy those two
-- accounts saw each other's roles and applicants, because scoping compared
-- company-name text. Giving each login its own org would be safe but would
-- silently take that shared view away from two colleagues at one clinic. They
-- are seated together instead, which is what team seats are for.
--
-- Matching on the name is acceptable here in a way it is not at runtime: this
-- is a one-off over four rows that were read before it was written, not a rule
-- that keeps applying to everyone who signs up later.
INSERT INTO "CadreEmployerOrg" ("id", "name", "facilityId", "isVerified", "createdAt", "updatedAt")
SELECT
  'org_' || MIN("id"),
  "companyName",
  MIN("facilityId"),
  bool_or("isVerified"),
  MIN("createdAt"),
  CURRENT_TIMESTAMP
FROM "CadreEmployerAccount"
GROUP BY "companyName";

-- AlterTable: the account becomes a seat within an org
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "orgId" TEXT;
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "role" "CadreEmployerRole" NOT NULL DEFAULT 'OWNER';
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "invitedById" TEXT;
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "invitedAt" TIMESTAMP(3);
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "acceptedAt" TIMESTAMP(3);
ALTER TABLE "CadreEmployerAccount" ADD COLUMN "lastLoginAt" TIMESTAMP(3);

UPDATE "CadreEmployerAccount" a
SET "orgId" = o."id"
FROM "CadreEmployerOrg" o
WHERE a."companyName" = o."name";

ALTER TABLE "CadreEmployerAccount" ALTER COLUMN "orgId" SET NOT NULL;

-- The earliest account on each org owns it; anyone who joined afterwards gets a
-- recruiter seat, which can do the work but cannot invite or remove people.
UPDATE "CadreEmployerAccount" SET "role" = 'RECRUITER'
WHERE "id" NOT IN (
  SELECT DISTINCT ON ("orgId") "id"
  FROM "CadreEmployerAccount"
  ORDER BY "orgId", "createdAt" ASC
);

-- Everyone who already had a password chose it themselves, so their seat is
-- accepted rather than pending an invitation.
UPDATE "CadreEmployerAccount" SET "acceptedAt" = "createdAt";

-- The facility now hangs off the org, so one hospital can have more than one
-- login. The unique constraint on the account was a hard cap of one.
DROP INDEX IF EXISTS "CadreEmployerAccount_facilityId_key";
ALTER TABLE "CadreEmployerAccount" DROP CONSTRAINT IF EXISTS "CadreEmployerAccount_facilityId_fkey";
ALTER TABLE "CadreEmployerAccount" DROP COLUMN "facilityId";

CREATE INDEX "CadreEmployerAccount_orgId_idx" ON "CadreEmployerAccount"("orgId");
ALTER TABLE "CadreEmployerAccount" ADD CONSTRAINT "CadreEmployerAccount_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "CadreEmployerOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: roles get a real owner
ALTER TABLE "CadreMandate" ADD COLUMN "employerOrgId" TEXT;

-- Backfill: match a role to an org by the facility it was posted against, then
-- by the exact company name it was posted under. Anything left null is a role we
-- run ourselves out of admin, which is correct.
UPDATE "CadreMandate" m
SET "employerOrgId" = o."id"
FROM "CadreEmployerOrg" o
WHERE m."facilityId" IS NOT NULL AND m."facilityId" = o."facilityId";

UPDATE "CadreMandate" m
SET "employerOrgId" = o."id"
FROM "CadreEmployerOrg" o
WHERE m."employerOrgId" IS NULL
  AND m."facilityName" IS NOT NULL
  AND m."facilityName" = o."name";

CREATE INDEX "CadreMandate_employerOrgId_status_idx" ON "CadreMandate"("employerOrgId", "status");
ALTER TABLE "CadreMandate" ADD CONSTRAINT "CadreMandate_employerOrgId_fkey"
  FOREIGN KEY ("employerOrgId") REFERENCES "CadreEmployerOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AlterTable: applied and sourced stop sharing one undifferentiated list
ALTER TABLE "CadreMandateMatch" ADD COLUMN "source" "CadreMatchSource" NOT NULL DEFAULT 'SOURCED';

-- The apply routes wrote "APPLIED" into status, which no reader recognised, so
-- every portal application rendered to the employer as "Matched". Those rows are
-- applications: the word belongs in source, and the stage resets to NEW.
UPDATE "CadreMandateMatch" SET "source" = 'APPLIED', "status" = 'NEW' WHERE "status" = 'APPLIED';
UPDATE "CadreMandateMatch" SET "status" = 'NEW' WHERE "status" = 'MATCHED';
ALTER TABLE "CadreMandateMatch" ALTER COLUMN "status" SET DEFAULT 'NEW';

CREATE INDEX "CadreMandateMatch_mandateId_source_idx" ON "CadreMandateMatch"("mandateId", "source");

-- CreateTable: the list an employer builds while searching
CREATE TABLE "CadreShortlist" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "notes" TEXT,
    "mandateId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreShortlist_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "CadreShortlist_orgId_idx" ON "CadreShortlist"("orgId");
CREATE INDEX "CadreShortlist_mandateId_idx" ON "CadreShortlist"("mandateId");

ALTER TABLE "CadreShortlist" ADD CONSTRAINT "CadreShortlist_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "CadreEmployerOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadreShortlist" ADD CONSTRAINT "CadreShortlist_mandateId_fkey"
  FOREIGN KEY ("mandateId") REFERENCES "CadreMandate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable
CREATE TABLE "CadreShortlistEntry" (
    "id" TEXT NOT NULL,
    "shortlistId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "note" TEXT,
    "addedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "CadreShortlistEntry_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CadreShortlistEntry_shortlistId_professionalId_key" ON "CadreShortlistEntry"("shortlistId", "professionalId");
CREATE INDEX "CadreShortlistEntry_shortlistId_idx" ON "CadreShortlistEntry"("shortlistId");
CREATE INDEX "CadreShortlistEntry_professionalId_idx" ON "CadreShortlistEntry"("professionalId");

ALTER TABLE "CadreShortlistEntry" ADD CONSTRAINT "CadreShortlistEntry_shortlistId_fkey"
  FOREIGN KEY ("shortlistId") REFERENCES "CadreShortlist"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadreShortlistEntry" ADD CONSTRAINT "CadreShortlistEntry_professionalId_fkey"
  FOREIGN KEY ("professionalId") REFERENCES "CadreProfessional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadreShortlistEntry" ADD CONSTRAINT "CadreShortlistEntry_addedById_fkey"
  FOREIGN KEY ("addedById") REFERENCES "CadreEmployerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateTable: the consent that sits between an employer and someone's contact
-- details. Most of the register was imported and never asked whether hospitals
-- could approach them, so nothing is released without one of these coming back
-- ACCEPTED.
CREATE TABLE "CadreContactRequest" (
    "id" TEXT NOT NULL,
    "orgId" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "mandateId" TEXT,
    "message" TEXT,
    "status" "CadreContactRequestStatus" NOT NULL DEFAULT 'PENDING',
    "respondedAt" TIMESTAMP(3),
    "expiresAt" TIMESTAMP(3),
    "requestedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CadreContactRequest_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "CadreContactRequest_orgId_professionalId_mandateId_key" ON "CadreContactRequest"("orgId", "professionalId", "mandateId");
CREATE INDEX "CadreContactRequest_professionalId_status_idx" ON "CadreContactRequest"("professionalId", "status");
CREATE INDEX "CadreContactRequest_orgId_status_idx" ON "CadreContactRequest"("orgId", "status");

ALTER TABLE "CadreContactRequest" ADD CONSTRAINT "CadreContactRequest_orgId_fkey"
  FOREIGN KEY ("orgId") REFERENCES "CadreEmployerOrg"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadreContactRequest" ADD CONSTRAINT "CadreContactRequest_professionalId_fkey"
  FOREIGN KEY ("professionalId") REFERENCES "CadreProfessional"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "CadreContactRequest" ADD CONSTRAINT "CadreContactRequest_mandateId_fkey"
  FOREIGN KEY ("mandateId") REFERENCES "CadreMandate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "CadreContactRequest" ADD CONSTRAINT "CadreContactRequest_requestedById_fkey"
  FOREIGN KEY ("requestedById") REFERENCES "CadreEmployerAccount"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: when someone last said something about being approached, so a
-- stated availability can go stale honestly rather than stand forever.
ALTER TABLE "CadreProfessional" ADD COLUMN "availabilityUpdatedAt" TIMESTAMP(3);
