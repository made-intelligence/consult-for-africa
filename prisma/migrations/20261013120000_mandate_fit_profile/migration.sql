-- The client's own account of fit, which applicants are scored against.
ALTER TABLE "CadreMandate" ADD COLUMN "fitProfile" JSONB;
ALTER TABLE "CadreMandate" ADD COLUMN "fitProfileAt" TIMESTAMP(3);
