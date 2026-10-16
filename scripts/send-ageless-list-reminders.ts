/**
 * The reminder to the AGELESS invitation list: everybody written to who has
 * not registered.
 *
 * The list is the platform's record of who was sent the invitation
 * (LyfeInvitation, 198 on 16 October 2026). Dropped before anything is sent:
 * suppressed addresses, anyone whose address has since registered, and anyone
 * already reminded, which docs/ageless/lists/reminded.csv records (not in git).
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-reminders.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-reminders.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-list-reminders.ts --send
 */
import { appendFileSync, existsSync, readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { emailLyfeListReminder } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const LEDGER = "docs/ageless/lists/reminded.csv";
/** The list's own key, so a registration from this mail is credited to it. */
const LINK = "https://www.consultforafrica.com/ageless?i=list";

/** "Dr. Orode Doherty" greets as Orode. Same rule as the first invitation. */
function firstNameOf(full: string): string {
  if (!full.trim()) return "colleagues";
  const drop = /^(dr|prof|professor|mrs|mr|ms|miss|chief|barr|hajia|dame|engr|alhaji|sir|princess|olorogun|erelu)\.?$/i;
  const parts = full.trim().split(/\s+/).filter((w) => !drop.test(w));
  return (parts[0] || full).replace(/[“”"']/g, "");
}

type Invitee = { email: string; name: string; onBehalfOf: string | null; source: string };

async function main() {
  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  if (test) {
    await emailLyfeListReminder({ to: TEST_TO, firstName: "Debo", link: LINK });
    await emailLyfeListReminder({ to: TEST_TO, firstName: "colleagues", link: LINK, onBehalfOf: "Dr Andrew Example" });
    console.log(`Sent both versions to ${TEST_TO}: to a person, and to an office.`);
    return;
  }

  // LyfeInvitation is on main's schema and not yet this branch's, so raw.
  const invited = await prisma.$queryRawUnsafe<Invitee[]>(
    // Two days at least since the invitation. On 16 October Yomi's twelve were
    // invited and then reminded within minutes, because this read the table
    // the invitation had just written to.
    `select lower(email) email, name, "onBehalfOf", source from "LyfeInvitation" where "sentAt" < now() - interval '2 days' order by "sentAt"`,
  );
  const registered = new Set(
    (await prisma.lyfeEnquiry.findMany({ select: { email: true } })).map((r) => r.email.toLowerCase()),
  );
  const suppressed = new Set(
    (await prisma.communicationSuppression.findMany({
      where: { email: { in: invited.map((r) => r.email) } },
      select: { email: true },
    })).map((s) => (s.email ?? "").toLowerCase()),
  );
  const reminded = new Set(
    existsSync(LEDGER)
      ? readFileSync(LEDGER, "utf8").trim().split(/\r?\n/).slice(1).map((l) => l.split(",")[0].trim().toLowerCase())
      : [],
  );

  const targets = invited.filter(
    (r) => !registered.has(r.email) && !suppressed.has(r.email) && !reminded.has(r.email),
  );

  console.log(`\nAGELESS reminder to the list`);
  console.log(`  invited                 ${invited.length}`);
  console.log(`  dropped, registered     ${invited.filter((r) => registered.has(r.email)).length}`);
  console.log(`  dropped, suppressed     ${invited.filter((r) => suppressed.has(r.email)).length}`);
  console.log(`  dropped, reminded       ${invited.filter((r) => reminded.has(r.email)).length}`);
  console.log(`  TO REMIND               ${targets.length}`);
  console.log(`  link carried            ${LINK}\n`);

  if (!send) {
    for (const r of targets.slice(0, 15)) {
      console.log(`  ${r.source.padEnd(7)} ${r.name.padEnd(30)} ${r.email}${r.onBehalfOf ? `  (for ${r.onBehalfOf})` : ""}`);
    }
    if (targets.length > 15) console.log(`  ... and ${targets.length - 15} more`);
    console.log("\nDry run. --test writes to you, --send goes live.");
    return;
  }

  let ok = 0;
  for (const r of targets) {
    // An office row stored with the principal's name as its name greets the
    // office, not the principal.
    const greet = r.onBehalfOf && r.name === r.onBehalfOf ? "colleagues" : firstNameOf(r.name);
    try {
      await emailLyfeListReminder({ to: r.email, firstName: greet, link: LINK, onBehalfOf: r.onBehalfOf });
      if (!existsSync(LEDGER)) appendFileSync(LEDGER, "email,name,sentAt\n");
      appendFileSync(LEDGER, `${r.email},"${r.name.replace(/"/g, "")}",${new Date().toISOString()}\n`);
      ok++;
      console.log(`  SENT    ${r.name.padEnd(30)} ${r.email}`);
    } catch (err) {
      console.error(`  FAILED  ${r.name.padEnd(30)} ${r.email}  ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((res) => setTimeout(res, 350));
  }
  console.log(`\n${ok} of ${targets.length} reminded.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
