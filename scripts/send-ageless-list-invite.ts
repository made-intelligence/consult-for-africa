/**
 * The invitation to the event list.
 *
 * Dry by default. These go to people outside the firm who have not asked to
 * hear from us, so nothing leaves without --send, and --test writes to one
 * address first.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --send --size=25
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-invite.ts --send
 *
 * The list is docs/ageless/lists/invite-list.csv with at least name,email.
 * Suppressed addresses are dropped before anything is sent, because the
 * domain that carries this also carries every client's mail.
 *
 * Every address that goes out is written to sent.csv beside the list, and
 * anybody already in it is skipped. So --send --size=25 can be run again for
 * the next twenty five without anyone being written to twice, which matters
 * more here than usual: this list is senior and a duplicate is remembered.
 */
import { appendFileSync, existsSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { lyfeInviteLink, LYFE_EVENT } from "@/lib/lyfe";
import { emailLyfeListInvite } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const size = Number(args.find((a) => a.startsWith("--size="))?.split("=")[1] ?? 0);
const TEST_TO =
  args.find((a) => a.startsWith("--to="))?.split("=")[1] ||
  process.env.LYFE_TEST_TO ||
  "dodulana@gmail.com";
/** Who the preview is addressed to. A host should not be asked to register. */
const TEST_NAME = args.find((a) => a.startsWith("--as="))?.split("=")[1] || "Debo";
const CSV = "docs/ageless/lists/invite-list.csv";
const LEDGER = "docs/ageless/lists/sent.csv";
const LINK = lyfeInviteLink("list");

/** "Dr. Orode Doherty" greets as Orode. Titles are not first names. */
function firstNameOf(full: string): string {
  const drop = /^(dr|prof|professor|mrs|mr|ms|miss|chief|barr|hajia|dame|engr|alhaji|sir|princess|olorogun|erelu)\.?$/i;
  const parts = full.trim().split(/\s+/).filter((w) => !drop.test(w));
  return (parts[0] || full).replace(/[“”"']/g, "");
}

function rows(): { name: string; email: string }[] {
  if (!existsSync(CSV)) return [];
  const [head, ...lines] = readFileSync(CSV, "utf8").trim().split(/\r?\n/);
  const cols = head.split(",").map((c) => c.trim().toLowerCase());
  const iName = cols.indexOf("name");
  const iMail = cols.indexOf("email");
  const out: { name: string; email: string }[] = [];
  for (const line of lines) {
    const cells = line.match(/("[^"]*"|[^,]+)/g)?.map((c) => c.replace(/^"|"$/g, "").trim()) ?? [];
    const name = cells[iName] ?? "";
    const email = (cells[iMail] ?? "").toLowerCase();
    if (name && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) out.push({ name, email });
  }
  return out;
}

async function main() {
  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  if (test) {
    console.log(`TEST: one invitation to ${TEST_TO}, addressed to ${TEST_NAME}\n`);
    await emailLyfeListInvite({
      to: TEST_TO, firstName: TEST_NAME, link: LINK,
    });
    console.log(`  sent. link in it: ${LINK}`);
    return;
  }

  const all = rows();
  if (!all.length) {
    console.error(`No rows. Put the list at ${CSV} with columns name,email.`);
    process.exit(1);
  }

  // One address per person, and never one we have already burned.
  const seen = new Set<string>();
  const deduped = all.filter((r) => !seen.has(r.email) && seen.add(r.email));
  const suppressed = new Set(
    (await prisma.communicationSuppression.findMany({
      where: { email: { in: deduped.map((r) => r.email) } },
      select: { email: true },
    })).map((s) => s.email.toLowerCase()),
  );
  const alreadySent = new Set(
    existsSync(LEDGER)
      ? readFileSync(LEDGER, "utf8").trim().split(/\r?\n/).slice(1)
          .map((l) => (l.split(",")[0] || "").trim().toLowerCase()).filter(Boolean)
      : [],
  );
  const eligible = deduped.filter(
    (r) => !suppressed.has(r.email) && !alreadySent.has(r.email),
  );
  const targets = size ? eligible.slice(0, size) : eligible;

  console.log(`\nAGELESS invitation, ${LYFE_EVENT.date}`);
  console.log(`  rows in the file        ${all.length}`);
  console.log(`  after deduplication     ${deduped.length}`);
  console.log(`  dropped, suppressed     ${deduped.filter((r) => suppressed.has(r.email)).length}`);
  console.log(`  dropped, already sent   ${deduped.filter((r) => alreadySent.has(r.email)).length}`);
  console.log(`  still to write to       ${eligible.length}`);
  console.log(`  THIS BATCH              ${targets.length}${size ? `  (--size=${size})` : "  (all of them)"}`);
  console.log(`  remaining after this    ${eligible.length - targets.length}`);
  console.log(`  link carried            ${LINK}\n`);

  if (!send) {
    console.log("DRY RUN. --test writes one to you, --send goes live.\n");
    for (const r of targets.slice(0, 20)) {
      console.log(`  ${firstNameOf(r.name).padEnd(14)} ${r.name.padEnd(30)} ${r.email}`);
    }
    if (targets.length > 20) console.log(`  ... and ${targets.length - 20} more`);
    return;
  }

  let ok = 0;
  for (const r of targets) {
    try {
      await emailLyfeListInvite({
        to: r.email, firstName: firstNameOf(r.name), link: LINK,
      });
      ok++;
      if (!existsSync(LEDGER)) appendFileSync(LEDGER, "email,name,sentAt\n");
      appendFileSync(LEDGER, `${r.email},"${r.name.replace(/"/g, "")}",${new Date().toISOString()}\n`);
      console.log(`  SENT    ${r.name.padEnd(30)} ${r.email}`);
    } catch (err) {
      console.error(`  FAILED  ${r.name.padEnd(30)} ${r.email}  ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((res) => setTimeout(res, 350));
  }
  console.log(`\n${ok} of ${targets.length} sent. ${eligible.length - ok} left on the list.`);
  console.log(`Ledger: ${LEDGER}. Run the same command again for the next batch.`);
}

main().finally(() => prisma.$disconnect());
