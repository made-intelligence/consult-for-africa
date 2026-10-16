/**
 * A reminder to everybody invited to AGELESS who has not yet answered.
 *
 * Same link as their invitation, so it confirms the same place. Nobody who
 * has confirmed or declined is written to.
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-ageless-reminders.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-reminders.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-reminders.ts --send
 *   npx tsx --env-file=.env.local scripts/send-ageless-reminders.ts --test-held
 *
 * --test sends the reminder and the invitation to LYFE_TEST_TO only, with a
 * dummy link, so the copy can be read as a guest would see it. --test-held
 * sends LYFE_TEST_TO the "your place is held" note a guest gets on confirming.
 */
import { PrismaClient } from "@prisma/client";
import {
  emailLyfeAttendanceConfirmed,
  emailLyfeInvitation,
  emailLyfeInvitationReminder,
} from "@/lib/lyfeEmail";

// Guests click these links, so they point at production whatever .env.local
// says. lyfeConfirmUrl reads NEXTAUTH_URL, which is localhost in development.
process.env.NEXTAUTH_URL = "https://www.consultforafrica.com";

const prisma = new PrismaClient();
const FROM_NAME = process.env.LYFE_SENDER_NAME || "Dr Debo Odulana";
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";

async function main() {
  const args = process.argv.slice(2);
  const test = args.includes("--test");
  const send = args.includes("--send");
  const testHeld = args.includes("--test-held");

  if ((send || test || testHeld) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  if (testHeld) {
    await emailLyfeAttendanceConfirmed({ to: TEST_TO, firstName: "Debo", guestCount: 1 });
    console.log(`Sent the place-held note to ${TEST_TO}.`);
    return;
  }

  if (test) {
    const token = "test-link-does-not-work";
    await emailLyfeInvitationReminder({ to: TEST_TO, firstName: "Debo", token, from: FROM_NAME });
    await emailLyfeInvitation({ to: TEST_TO, firstName: "Debo", token, from: FROM_NAME });
    console.log(`Sent the reminder and the invitation to ${TEST_TO}.`);
    return;
  }

  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: "INVITED", inviteToken: { not: null } },
    orderBy: { invitedAt: "asc" },
    select: { id: true, fullName: true, email: true, inviteToken: true, invitedAt: true },
  });

  console.log(`${rows.length} invited and not yet answered:`);
  for (const r of rows) {
    console.log(`  ${r.fullName.padEnd(30)} ${r.email.padEnd(36)} invited ${r.invitedAt?.toISOString().slice(0, 16) ?? "-"}`);
  }
  if (!send) {
    console.log("\nDry run. Add --send to write to them.");
    return;
  }

  let sent = 0;
  for (const r of rows) {
    const firstName = r.fullName.trim().split(/\s+/)[0] ?? r.fullName;
    try {
      await emailLyfeInvitationReminder({ to: r.email, firstName, token: r.inviteToken!, from: FROM_NAME });
      const stamp = new Date().toISOString().slice(0, 16).replace("T", " ");
      const existing = await prisma.lyfeEnquiry.findUnique({ where: { id: r.id }, select: { coordinatorNotes: true } });
      const entry = `[${stamp} script] Reminder sent.`;
      await prisma.lyfeEnquiry.update({
        where: { id: r.id },
        data: { coordinatorNotes: existing?.coordinatorNotes ? `${entry}\n\n${existing.coordinatorNotes}` : entry },
      });
      sent++;
      console.log(`  sent  ${r.fullName}`);
    } catch (err) {
      console.error(`  FAILED  ${r.fullName}:`, err);
    }
  }
  console.log(`\n${sent} of ${rows.length} sent.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
