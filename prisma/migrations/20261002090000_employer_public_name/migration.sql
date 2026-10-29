-- A confidential search has to be confidential in the approach as well as on
-- the board. The listing already showed an anonymous label, but a contact
-- request told the professional "<real client name> would like to contact you",
-- which gave the name away in the first message we sent.

ALTER TABLE "CadreEmployerOrg" ADD COLUMN "publicName" TEXT;

-- The one client already running as a confidential search. The value matches
-- the label its roles already carry on the board.
UPDATE "CadreEmployerOrg"
SET "publicName" = 'Confidential healthcare group'
WHERE "name" = 'Medbury Medical Services';
