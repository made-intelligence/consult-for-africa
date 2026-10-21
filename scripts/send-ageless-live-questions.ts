/**
 * The day-of note to every confirmed AGELESS guest: live questions at
 * consultforafrica.com/live, and the pass the door scans.
 *
 * Send only once /live is up in production. Anyone already written to is
 * recorded in coordinatorNotes and skipped on a rerun.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-live-questions.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-live-questions.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-live-questions.ts --send
 */
import { createHash } from "crypto";
import { PrismaClient } from "@prisma/client";
import { emailAgelessLiveQuestions } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const SENT = "Live questions note sent";

/** Same as the pass, with the original code for guests re-created on 20 October. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function heldCode(id: string, notes: string | null): string {
  const m = notes?.match(/Original pass code: (AGL-[2-9A-HJ-NP-Z]{4})/);
  if (m) return m[1];
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
    await emailAgelessLiveQuestions({ to: TEST_TO, firstName: "Debo", passCode: "AGL-TEST" });
    console.log(`Sent a sample to ${TEST_TO}.`);
    return;
  }
  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: "CONFIRMED" },
    orderBy: { createdAt: "asc" },
    select: { id: true, fullName: true, email: true, coordinatorNotes: true },
  });
  // One note per address: a second registration under the same email is skipped.
  const seen = new Set<string>();
  let sent = 0;
  for (const r of rows) {
    const email = r.email.trim().toLowerCase();
    if (seen.has(email) || r.coordinatorNotes?.includes(SENT)) continue;
    seen.add(email);
    const code = heldCode(r.id, r.coordinatorNotes);
    const line = `  ${code}  ${r.fullName.padEnd(30)} ${r.email}`;
    if (!send) {
      console.log(line);
      continue;
    }
    await emailAgelessLiveQuestions({ to: r.email, firstName: firstNameOf(r.fullName), passCode: code });
    const stamp = `${new Date().toISOString().slice(0, 10)}: ${SENT}.`;
    await prisma.lyfeEnquiry.update({
      where: { id: r.id },
      data: { coordinatorNotes: r.coordinatorNotes ? `${stamp}\n${r.coordinatorNotes}` : stamp },
    });
    console.log(`${line}  SENT`);
    sent++;
  }
  console.log(send ? `\n${sent} sent.` : `\n${seen.size} to write to. DRY RUN. --test for a sample, --send to go live.`);
}

main().finally(() => prisma.$disconnect());
