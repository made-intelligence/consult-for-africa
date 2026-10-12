#!/bin/bash
# One AGELESS batch. Installed in cron for Monday 12 October.
#
# Each run sends the next 25 and stops. The ledger in docs/ageless/lists/sent.csv
# is what makes a repeat safe, so these entries can fire in any order and nobody
# is written to twice.
#
# ABORT: touch docs/ageless/lists/STOP and no further batch will send.
set -u
REPO="/Users/debo/consult-for-africa"
export PATH="/usr/local/bin:/opt/homebrew/bin:/usr/bin:/bin"
cd "$REPO" || exit 1

STAMP=$(date "+%Y-%m-%d %H:%M:%S %Z")
LOG="$REPO/logs/ageless-send.log"

if [ -f "$REPO/docs/ageless/lists/STOP" ]; then
  echo "[$STAMP] STOP file present, not sending." >> "$LOG"
  exit 0
fi

{
  echo ""
  echo "===== [$STAMP] batch starting ====="
} >> "$LOG"

npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --send --size=25 >> "$LOG" 2>&1
RC=$?

SENT=$(( $(wc -l < "$REPO/docs/ageless/lists/sent.csv" 2>/dev/null || echo 1) - 1 ))
{
  echo "----- exit $RC, $SENT written to in total -----"
} >> "$LOG"

# A bounce storm is the one thing nobody is awake to catch, so the run stops
# itself rather than carrying on into the afternoon.
BOUNCES=$(npx tsx --env-file=.env.local -e '
import { PrismaClient } from "@prisma/client";
const p = new PrismaClient();
const since = new Date(Date.now() - 6 * 3600 * 1000);
p.communicationSuppression.count({ where: { createdAt: { gte: since }, reason: "BOUNCED" } })
  .then((n) => { console.log(n); return p.$disconnect(); })
  .catch(() => { console.log(0); return p.$disconnect(); });
' 2>/dev/null | tail -1)

if [ "${BOUNCES:-0}" -ge 6 ]; then
  touch "$REPO/docs/ageless/lists/STOP"
  echo "[$STAMP] $BOUNCES bounces in six hours. STOP written, no further batches." >> "$LOG"
fi
