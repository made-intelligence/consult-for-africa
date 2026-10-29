/**
 * The eve-of reminder to every confirmed AGELESS guest, for Tuesday 20 October.
 *
 * When, where, smart casual, and their pass code (the same hash
 * send-ageless-passes.ts printed on the pass). A host with guests still
 * unnamed gets their /ageless/guests link again. Anyone already reminded is
 * recorded in coordinatorNotes and skipped on a rerun. Guests without a pass
 * yet are reported, not written to: run send-ageless-passes.ts first.
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-ageless-eve-reminder.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-eve-reminder.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-eve-reminder.ts --send
 */
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { emailLyfeEveReminder } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const PASS_SENT = "Access pass sent";
const REMINDED = "Eve reminder sent";
const GUESTS_BASE = "https://www.consultforafrica.com/ageless/guests/";

/** Same as send-ageless-passes.ts, so the code matches the printed pass. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function passCode(id: string): string {
  const h = createHash("sha256").update(`ageless:${id}`).digest();
  return "AGL-" + Array.from(h.subarray(0, 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

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
    await emailLyfeEveReminder({ to: TEST_TO, firstName: "Debo", passCode: passCode("test"), guestLink: `${GUESTS_BASE}test`, unnamed: 1 });
    console.log(`Sent a sample to ${TEST_TO}, with the unnamed-guest line.`);
    return;
  }

  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, email: true, guestCount: true, inviteToken: true, coordinatorNotes: true },
  });

  let sent = 0;
  const noPass: string[] = [];
  for (const r of rows) {
    if (r.coordinatorNotes?.includes(REMINDED)) continue;
    if (!r.coordinatorNotes?.includes(PASS_SENT)) {
      noPass.push(r.fullName);
      continue;
    }
    const unnamed = r.guestCount ?? 0;
    const guestLink = unnamed > 0 && r.inviteToken ? GUESTS_BASE + r.inviteToken : null;
    const line = `  ${passCode(r.id)}  ${r.fullName.padEnd(30)} ${r.email}${guestLink ? `  (+${unnamed} to name)` : ""}`;
    if (!send) {
      console.log(line);
      continue;
    }
    await emailLyfeEveReminder({ to: r.email, firstName: firstNameOf(r.fullName), passCode: passCode(r.id), guestLink, unnamed });
    const stamp = `${new Date().toISOString().slice(0, 10)}: ${REMINDED}.`;
    await prisma.lyfeEnquiry.update({
      where: { id: r.id },
      data: { coordinatorNotes: r.coordinatorNotes ? `${stamp}\n${r.coordinatorNotes}` : stamp },
    });
    console.log(`${line}  SENT`);
    sent++;
  }
  if (noPass.length) console.log(`\nNo pass yet, not written to (run send-ageless-passes.ts first): ${noPass.join(", ")}`);
  console.log(send ? `\n${sent} sent.` : "\nDRY RUN. --test for a sample, --send to go live.");
}

main().finally(() => prisma.$disconnect());
