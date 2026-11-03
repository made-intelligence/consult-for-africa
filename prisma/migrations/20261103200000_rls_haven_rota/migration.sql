-- Row level security on the two rota tables, like every other public table
-- (see 20260325000000_enable_rls_all_tables). No policies: the anon and
-- authenticated roles read nothing; Prisma connects as the owner and bypasses.
ALTER TABLE public."StaffRota" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."StaffShift" ENABLE ROW LEVEL SECURITY;
