#!/bin/sh
# Build step: lock the Supabase REST API out of the app's database
# (prisma/sql/lock-supabase-api.sql). Uses the direct (non-pooled) Supabase
# connection the Vercel integration provides. Never fails the build: a deploy
# must not be blocked by it, so a failure is logged loudly instead.
URL="${STORAGE_POSTGRES_URL_NON_POOLING:-$DIRECT_URL}"
if [ -z "$URL" ]; then
  echo "[lock-supabase-api] skipped: no STORAGE_POSTGRES_URL_NON_POOLING"
  exit 0
fi
if npx prisma db execute --url "$URL" --file prisma/sql/lock-supabase-api.sql; then
  echo "[lock-supabase-api] ok: RLS on for every public table, API roles revoked"
else
  echo "[lock-supabase-api] FAILED: Supabase API may still expose tables" >&2
fi
exit 0
