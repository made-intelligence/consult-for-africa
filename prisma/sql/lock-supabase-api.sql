-- Keeps the Supabase public API (PostgREST) out of this database.
--
-- The app reaches Postgres only through Prisma, as the table owner, which RLS
-- does not apply to. Supabase also serves every table in "public" over its
-- REST API to the anon and authenticated roles; with RLS off that exposed
-- users' password hashes and reset tokens. This turns RLS on for every public
-- table (no policies, so the API sees nothing) and removes the API roles'
-- grants, now and for tables future migrations create.
--
-- Runs on every build (scripts/lock-supabase-api.sh). Idempotent.

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' and rowsecurity = false loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;

  if exists (select 1 from pg_roles where rolname = 'anon') and exists (select 1 from pg_roles where rolname = 'authenticated') then
    execute 'revoke all on all tables in schema public from anon, authenticated';
    execute 'revoke all on all sequences in schema public from anon, authenticated';
    execute 'revoke all on all functions in schema public from anon, authenticated';
    execute 'alter default privileges in schema public revoke all on tables from anon, authenticated';
    execute 'alter default privileges in schema public revoke all on sequences from anon, authenticated';
    execute 'alter default privileges in schema public revoke all on functions from anon, authenticated';
  end if;
end $$;
