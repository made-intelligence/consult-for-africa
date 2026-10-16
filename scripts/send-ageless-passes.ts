/**
 * Confirm every AGELESS registration as a guest and send each their pass.
 *
 * Decided by Debo on 16 October 2026: everybody who registered interest is
 * confirmed, rather than invited and asked to confirm. Each gets the "your
 * place is held" mail with a personal access pass, built by
 * scripts/build-ageless-passes.py, inline and attached. That includes the few
 * who were sent the earlier mail without one.
 *
 * Declined and waitlisted rows are left alone. A row already sent a pass is
 * skipped, so the script can be run again for whoever registers next. Two
 * registrations under the same name (title aside) are one person: the first
 * is kept and the second is reported, not written to.
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-ageless-passes.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-passes.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-passes.ts --send
 */
import { execFileSync } from "child_process";
import { createHash } from "crypto";
import { mkdtempSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { PrismaClient } from "@prisma/client";
import { LYFE_EVENT } from "@/lib/lyfe";
import { emailLyfeAttendanceConfirmed } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const PASS_SENT = "Access pass sent";

/** Four characters a door can read aloud: no 0/O, 1/I/L. */
const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function passCode(id: string): string {
  const h = createHash("sha256").update(`ageless:${id}`).digest();
  return "AGL-" + Array.from(h.subarray(0, 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

const sameName = (n: string) =>
  n.toLowerCase().replace(/^(dr|mr|mrs|ms|miss|prof)\.?\s+/, "").replace(/\s+/g, " ").trim();

function buildPasses(guests: { key: string; name: string; admits: number; code: string }[]) {
  const dir = mkdtempSync(join(tmpdir(), "ageless-passes-"));
  writeFileSync(join(dir, "guests.json"), JSON.stringify(guests));
  execFileSync("python3", ["scripts/build-ageless-passes.py", join(dir, "guests.json"), dir], {
    stdio: ["ignore", "ignore", "inherit"],
  });
  return (key: string) => readFileSync(join(dir, `${key}.png`)).toString("base64");
}

async function main() {
  const args = process.argv.slice(2);
  const test = args.includes("--test");
  const send = args.includes("--send");

  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  if (test) {
    const code = passCode("test");
    const png = buildPasses([{ key: "test", name: "Dr Debo Odulana", admits: 2, code }])("test");
    await emailLyfeAttendanceConfirmed({ to: TEST_TO, firstName: "Debo", guestCount: 1, pass: { code, png } });
    console.log(`Sent a sample pass (${code}) to ${TEST_TO}.`);
    return;
  }

  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: { in: ["INTERESTED", "INVITED", "CONFIRMED"] } },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, fullName: true, email: true, guestCount: true,
      eventStage: true, confirmedAt: true, coordinatorNotes: true,
    },
  });

  const seen = new Map<string, string>();
  const duplicates: string[] = [];
  const already: string[] = [];
  const targets: typeof rows = [];
  for (const r of rows) {
    const k = sameName(r.fullName);
    if (seen.has(k)) {
      duplicates.push(`${r.fullName} <${r.email}>, same as ${seen.get(k)}`);
      continue;
    }
    seen.set(k, `${r.fullName} <${r.email}>`);
    if (r.coordinatorNotes?.includes(PASS_SENT)) already.push(r.fullName);
    else targets.push(r);
  }

  const heads = (rs: typeof rows) => rs.reduce((n, r) => n + 1 + (r.guestCount ?? 0), 0);
  const holding = rows.filter((r) => r.coordinatorNotes?.includes(PASS_SENT));
  const total = heads(holding) + heads(targets);

  console.log(`${targets.length} to confirm and send a pass:`);
  for (const r of targets) {
    console.log(
      `  ${passCode(r.id)}  ${r.fullName.padEnd(30)} ${r.email.padEnd(38)} admits ${1 + (r.guestCount ?? 0)}  (${r.eventStage.toLowerCase()})`,
    );
  }
  if (already.length) console.log(`\nAlready have a pass: ${already.join(", ")}`);
  if (duplicates.length) {
    console.log("\nNot written to, a second registration:");
    for (const d of duplicates) console.log(`  ${d}`);
  }
  console.log(`\nHeads once sent: ${total} of ${LYFE_EVENT.places}.`);

  if (total > LYFE_EVENT.places) {
    console.error("That is over the room. Nothing sent.");
    process.exit(1);
  }
  if (!send) {
    console.log("\nDry run. Add --send to confirm them and send the passes.");
    return;
  }

  const png = buildPasses(
    targets.map((r) => ({ key: r.id, name: r.fullName.trim(), admits: 1 + (r.guestCount ?? 0), code: passCode(r.id) })),
  );

  let sent = 0;
  for (const r of targets) {
    const code = passCode(r.id);
    const firstName = r.fullName.trim().split(/\s+/)[0] ?? r.fullName;
    try {
      await emailLyfeAttendanceConfirmed({
        to: r.email,
        firstName,
        guestCount: r.guestCount,
        pass: { code, png: png(r.id) },
      });
      const now = new Date();
      const entry = `[${now.toISOString().slice(0, 16).replace("T", " ")} script] Confirmed. ${PASS_SENT}, ${code}.`;
      await prisma.lyfeEnquiry.update({
        where: { id: r.id },
        data: {
          eventStage: "CONFIRMED",
          confirmedAt: r.confirmedAt ?? now,
          declinedAt: null,
          coordinatorNotes: r.coordinatorNotes ? `${entry}\n\n${r.coordinatorNotes}` : entry,
        },
      });
      sent++;
      console.log(`  sent  ${code}  ${r.fullName}`);
    } catch (err) {
      console.error(`  FAILED  ${r.fullName}:`, err);
    }
  }
  console.log(`\n${sent} of ${targets.length} sent.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
