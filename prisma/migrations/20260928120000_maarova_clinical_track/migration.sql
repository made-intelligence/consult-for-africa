-- Maarova was meant to serve one clinical module to clinicians and a
-- non-clinical equivalent to everyone else. Neither half was built, and
-- clinical framing spread into 47 of the 126 items outside that module.
--
-- This adds the track a session is served on, the audience an item is written
-- for, and the twin link that pairs a clinical item with its non-clinical
-- counterpart. Scoring is untouched: twins carry the same dimension mapping.

CREATE TYPE "MaarovaAudience" AS ENUM ('BOTH', 'CLINICAL', 'NON_CLINICAL');
CREATE TYPE "MaarovaTrack" AS ENUM ('CLINICAL', 'NON_CLINICAL');

ALTER TYPE "MaarovaModuleType" ADD VALUE IF NOT EXISTS 'PLTI';

ALTER TABLE "MaarovaModule"   ADD COLUMN "audience" "MaarovaAudience" NOT NULL DEFAULT 'BOTH';
ALTER TABLE "MaarovaQuestion" ADD COLUMN "audience" "MaarovaAudience" NOT NULL DEFAULT 'BOTH';
ALTER TABLE "MaarovaQuestion" ADD COLUMN "twinOfId" TEXT;

-- Every session so far was taken by someone served the clinical form, because
-- it is the only form that has ever existed. Recording that is what makes the
-- existing 3,112 item responses interpretable once a second form exists.
ALTER TABLE "MaarovaAssessmentSession" ADD COLUMN "track" "MaarovaTrack" NOT NULL DEFAULT 'CLINICAL';

-- Null until asked. Unlike clinicalBackground, null here means unanswered.
ALTER TABLE "MaarovaUser" ADD COLUMN "track" "MaarovaTrack";

-- Norms must be per track, or a non-clinical taker is silently scored against
-- a clinician population.
ALTER TABLE "MaarovaNormativeData" ADD COLUMN "track" "MaarovaTrack";

DROP INDEX IF EXISTS "MaarovaNormativeData_moduleType_dimension_subDimension_coun_key";
CREATE UNIQUE INDEX "MaarovaNormativeData_module_dimension_sub_country_sector_role_track_key"
  ON "MaarovaNormativeData"("moduleType", "dimension", "subDimension", "country", "sectorType", "roleLevel", "track");
