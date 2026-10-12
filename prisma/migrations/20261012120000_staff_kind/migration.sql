-- What kind of person a StaffMember row is.
--
-- Every surface had been filtering on department, which worked until it did
-- not. Founders were receiving staff onboarding emails twice a week, a CFA test
-- account sat in the directory a nurse sees, and the sprint denominator counted
-- both. Department answers where somebody works; it was never going to answer
-- whether they are an employee of this hospital.
--
-- Backfill is by what we know, not by guesswork: the board department is the
-- founders, the two CFA rows are named, everybody else is an employee.

CREATE TYPE "StaffKind" AS ENUM ('EMPLOYEE', 'FOUNDER', 'PARTNER', 'TEST');

ALTER TABLE "StaffMember" ADD COLUMN "kind" "StaffKind" NOT NULL DEFAULT 'EMPLOYEE';

-- Non-working owners. Dr Odedina and Dr Shakirah are deliberately NOT here:
-- they work in the building, so they stay EMPLOYEE and carry a BOARD tier,
-- because what they need is an employee's needs plus the board's view.
UPDATE "StaffMember" SET "kind" = 'FOUNDER' WHERE "department" = 'BOARD';

-- CFA on site.
UPDATE "StaffMember" SET "kind" = 'PARTNER'
WHERE "position" ILIKE '%Consult for Africa%' AND "name" NOT ILIKE '%test account%';

UPDATE "StaffMember" SET "kind" = 'TEST' WHERE "name" ILIKE '%test account%';

CREATE INDEX "StaffMember_clientId_kind_idx" ON "StaffMember"("clientId", "kind");
