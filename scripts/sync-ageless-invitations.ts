/**
 * Copy the AGELESS invitation list and its sent ledger onto the platform.
 *
 * The CSVs stay off git (personal contact details); this puts the rows the
 * invitations page needs into LyfeInvitation. Safe to run again: it upserts by
 * email, and a ledger time only ever fills an empty sentAt.
 *
 *   npx tsx --env-file=.env.local scripts/sync-ageless-invitations.ts \
 *     --list=docs/ageless/lists/invite-list.csv --source=main \
 *     [--ledger=docs/ageless/lists/sent.csv] [--dry]
 *
 * Rows whose channel says "office route", or whose flag says they write to an
 * office, are tagged office whatever --source says.
 */
import { existsSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.split("=").slice(1).join("=");
const LIST = arg("list");
const LEDGER = arg("ledger");
const SOURCE = arg("source") ?? "main";
const DRY = process.argv.includes("--dry");

function splitCsv(line: string): string[] {
  const out: string[] = [];
  let cur = "";
  let quoted = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (quoted) {
      if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
      else if (ch === '"') quoted = false;
      else cur += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") { out.push(cur.trim()); cur = ""; }
    else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

function read(path: string): Record<string, string>[] {
  if (!existsSync(path)) throw new Error(`No file at ${path}`);
  const [head, ...lines] = readFileSync(path, "utf8").trim().split(/\r?\n/);
  const cols = splitCsv(head).map((c) => c.toLowerCase());
  return lines.map((l) => {
    const cells = splitCsv(l);
    return Object.fromEntries(cols.map((c, i) => [c, cells[i] ?? ""]));
  });
}

const VALID = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

async function main() {
  let listed = 0;
  let stamped = 0;

  if (LIST) {
    for (const r of read(LIST)) {
      const email = (r.email ?? "").toLowerCase();
      const name = r.name || r.onbehalfof;
      if (!name || !VALID.test(email)) continue;
      const office = r.channel === "office route" || (r.flag ?? "").includes("office");
      const data = { name, onBehalfOf: r.onbehalfof || null, source: office ? "office" : SOURCE };
      if (!DRY) {
        await prisma.lyfeInvitation.upsert({ where: { email }, create: { email, ...data }, update: data });
      }
      listed++;
    }
  }

  if (LEDGER) {
    for (const r of read(LEDGER)) {
      const email = (r.email ?? "").toLowerCase();
      const at = new Date(r.sentat);
      if (!VALID.test(email) || isNaN(at.getTime())) continue;
      if (!DRY) {
        const n = await prisma.lyfeInvitation.updateMany({ where: { email, sentAt: null }, data: { sentAt: at } });
        stamped += n.count;
      } else stamped++;
    }
  }

  console.log(`${DRY ? "DRY. " : ""}${listed} list rows upserted as ${SOURCE}, ${stamped} send times filled.`);
}

main().finally(() => prisma.$disconnect());
