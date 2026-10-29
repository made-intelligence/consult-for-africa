/**
 * Ask every confirmed AGELESS guest who is bringing people to name them, so
 * each guest gets an access pass of their own (scripts/send-ageless-passes.ts
 * sends those once the names are in).
 *
 * Hosts confirmed by send-ageless-passes.ts never had an invitation token, so
 * one is made for them here: the link is /ageless/guests/<token>. Anyone asked
 * already is recorded in coordinatorNotes and skipped on a rerun.
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-ageless-guest-names.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-guest-names.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-guest-names.ts --send
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import { emailLyfeGuestNames } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const ASKED = "Asked to name guests";
const BASE = "https://www.consultforafrica.com/ageless/guests/";

function firstNameOf(full: string): string {
  const drop = /^(dr|prof|professor|mrs|mr|ms|miss|chief|barr|engr|sir)\.?$/i;
  const parts = full.trim().split(/\s+/).filter((w) => !drop.test(w));
  const f = parts[0] || full.trim();
  return f === f.toUpperCase() ? f[0] + f.slice(1).toLowerCase() : f;
}

async function main() {
  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  if (test) {
    await emailLyfeGuestNames({ to: TEST_TO, firstName: "Debo", guestCount: 2, link: `${BASE}test` });
    console.log(`Sent a sample to ${TEST_TO}.`);
    return;
  }

  const hosts = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: "CONFIRMED", guestCount: { gt: 0 } },
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, email: true, guestCount: true, inviteToken: true, coordinatorNotes: true },
  });

  for (const h of hosts) {
    if (h.coordinatorNotes?.includes(ASKED)) {
      console.log(`  skip  ${h.fullName} (already asked)`);
      continue;
    }
    const line = `  ${String(h.guestCount).padEnd(2)} ${h.fullName.padEnd(30)} ${h.email}`;
    if (!send) {
      console.log(`${line}${h.inviteToken ? "" : "  (token to be made)"}`);
      continue;
    }
    const token = h.inviteToken ?? randomBytes(24).toString("base64url");
    if (!h.inviteToken) {
      await prisma.lyfeEnquiry.update({ where: { id: h.id }, data: { inviteToken: token } });
    }
    await emailLyfeGuestNames({ to: h.email, firstName: firstNameOf(h.fullName), guestCount: h.guestCount ?? 0, link: BASE + token });
    const stamp = `${new Date().toISOString().slice(0, 10)}: ${ASKED}.`;
    await prisma.lyfeEnquiry.update({
      where: { id: h.id },
      data: { coordinatorNotes: h.coordinatorNotes ? `${stamp}\n${h.coordinatorNotes}` : stamp },
    });
    console.log(`${line}  SENT`);
  }
  if (!send) console.log(`\n${hosts.length} hosts. DRY RUN. --test for a sample, --send to go live.`);
}

main().finally(() => prisma.$disconnect());
