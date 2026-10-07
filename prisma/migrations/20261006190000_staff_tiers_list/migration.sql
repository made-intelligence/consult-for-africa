-- One tier per person was wrong, and not as an edge case.
--
-- At Haven dual roles are the norm among the owners: Dr Odedina is Chief
-- Medical Director and a founder, Dr Shakirah is associate clinical director
-- and a founder. A single tier forces a choice between somebody's clinical role
-- and their ownership, and either choice is wrong. Capabilities become the
-- union of what the held tiers grant, which is also what keeps BOARD honest: a
-- founder who works clinically reads the ward's notes through LEADERSHIP, while
-- a founder who only owns shares holds BOARD alone and does not.
--
-- The previous migration is already applied in production, so this converts
-- rather than amending it. Backfill first, drop second, so nothing is lost.

-- AlterTable
ALTER TABLE "StaffMember" ADD COLUMN "tiers" "StaffTier"[] DEFAULT ARRAY['ALL_STAFF']::"StaffTier"[];

-- Backfill every existing row from the single value it already held.
UPDATE "StaffMember" SET "tiers" = ARRAY["tier"]::"StaffTier"[];

-- Only now is the old column redundant.
ALTER TABLE "StaffMember" DROP COLUMN "tier";
