-- Dr Kpaduwa visiting clinics in Lekki and Victoria Island to meet the doctors
-- who would refer to her. Doctor to doctor is the highest trust route into a
-- surgical practice, and it is a different conversation from a patient
-- enquiry, so it gets its own intent rather than being squeezed into one.

ALTER TYPE "LyfeIntent" ADD VALUE IF NOT EXISTS 'FACILITY_VISIT';

ALTER TABLE "LyfeEnquiry"
  ADD COLUMN "facilityName"  TEXT,
  ADD COLUMN "facilityArea"  TEXT,
  ADD COLUMN "clinicianRole" TEXT;
