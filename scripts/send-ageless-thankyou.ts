/**
 * After AGELESS: the thank-you to every guest, a note to those we could not
 * seat, and a thank-you to each speaker and the host.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-thankyou.ts            # dry run, lists who gets what
 *   npx tsx --env-file=.env.local scripts/send-ageless-thankyou.ts --test     # one of each to Debo
 *   npx tsx --env-file=.env.local scripts/send-ageless-thankyou.ts --send     # guests and speakers
 *
 * Nobody was checked in at the door, so the guest mail is worded to be true
 * whether or not they came. Guests without an invitation token get one, so
 * every link is personal and the forms already know who they are. Anyone sent
 * to is noted in coordinatorNotes and skipped on a rerun.
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";
import {
  emailAgelessMissedYou,
  emailAgelessSpeakerThanks,
  emailAgelessThankYou,
} from "@/lib/lyfeEmail";
import { agelessBookLink, agelessLink } from "@/lib/ageless-followup";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const SENT = "AGELESS thank-you sent";
const FROM_NAME = "Dr Debo Odulana";

/** The speakers and the host. Debo chaired, so he is not thanking himself. */
const SPEAKERS: { to: string | null; first: string; part: string }[] = [
  { to: "adedotun.ajelabi@medlyfewellness.com", first: "Dr Ajelabi", part: "giving the opening address" },
  { to: "timiadenuga@getslim.ng", first: "Dr Adenuga", part: "speaking on weight, metabolism and longevity" },
  { to: "hello@gbemigiwa.com", first: "Gbemi", part: "speaking on lifestyle and behaviour change" },
  { to: "Soar@joyceeawosika.com", first: "Joycee", part: "speaking on stress, self-care and recovery" },
  // Her address is not on file here. Add it and rerun.
  { to: process.env.KPADUWA_EMAIL || null, first: "Dr Kpaduwa", part: "speaking on skin, aesthetics and ageing well" },
  { to: "olive.emodi1@gmail.com", first: "Olive", part: "hosting the evening" },
];

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
  const share = agelessLink("").replace("src=thankyou", "src=plusone");

  if (test) {
    const page = agelessLink("");
    await emailAgelessThankYou({ to: TEST_TO, firstName: "Debo", pageLink: page, bookLink: agelessBookLink(), broughtGuests: 1, shareLink: share });
    await emailAgelessMissedYou({ to: TEST_TO, firstName: "Debo", pageLink: page, bookLink: agelessBookLink() });
    await emailAgelessSpeakerThanks({ to: TEST_TO, firstName: "Dr Adenuga", part: SPEAKERS[1].part, pageLink: page, fromName: FROM_NAME });
    console.log(`TEST: three mails to ${TEST_TO}`);
    return;
  }

  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: { in: ["CONFIRMED", "ATTENDED", "WAITLIST", "INTERESTED"] } },
    select: { id: true, fullName: true, email: true, eventStage: true, guestCount: true, inviteToken: true, coordinatorNotes: true },
    orderBy: { createdAt: "asc" },
  });
  // Named plus-ones are rows of their own (sourceDetail guest-of:<host>), so a
  // host is only asked to forward for the guests who never got a row.
  const named = await prisma.lyfeEnquiry.groupBy({
    by: ["sourceDetail"],
    where: { sourceDetail: { startsWith: "guest-of:" } },
    _count: true,
  });
  const namedFor = new Map(named.map((n) => [n.sourceDetail!.slice("guest-of:".length), n._count]));

  const seen = new Set<string>();
  let held = 0, missed = 0, skipped = 0;
  for (const r of rows) {
    const email = r.email.trim().toLowerCase();
    if (!email || seen.has(email) || (r.coordinatorNotes ?? "").includes(SENT)) {
      skipped++;
      continue;
    }
    seen.add(email);
    const placed = r.eventStage === "CONFIRMED" || r.eventStage === "ATTENDED";
    const unnamed = placed ? Math.max(0, (r.guestCount ?? 0) - (namedFor.get(r.id) ?? 0)) : 0;
    const first = firstNameOf(r.fullName);
    console.log(`${placed ? "THANKS " : "MISSED "} ${r.fullName} <${email}>${unnamed ? `  +${unnamed} to forward` : ""}`);
    if (!send) {
      placed ? held++ : missed++;
      continue;
    }
    const token = r.inviteToken ?? randomBytes(18).toString("base64url");
    const page = agelessLink("", token);
    if (placed) {
      await emailAgelessThankYou({ to: email, firstName: first, pageLink: page, bookLink: agelessBookLink(), broughtGuests: unnamed, shareLink: share });
      held++;
    } else {
      await emailAgelessMissedYou({ to: email, firstName: first, pageLink: page, bookLink: agelessBookLink() });
      missed++;
    }
    const note = `${new Date().toISOString().slice(0, 10)} ${SENT}.`;
    await prisma.lyfeEnquiry.update({
      where: { id: r.id },
      data: {
        ...(r.inviteToken ? {} : { inviteToken: token }),
        coordinatorNotes: r.coordinatorNotes ? `${note}\n${r.coordinatorNotes}` : note,
      },
    });
    await new Promise((res) => setTimeout(res, 400));
  }

  const page = agelessLink("").replace("src=thankyou", "src=speaker");
  for (const s of SPEAKERS) {
    console.log(`SPEAKER ${s.first} <${s.to ?? "NO ADDRESS, skipped"}>`);
    if (send && s.to) {
      await emailAgelessSpeakerThanks({ to: s.to, firstName: s.first, part: s.part, pageLink: page, fromName: FROM_NAME });
    }
  }

  console.log(`\n${send ? "SENT" : "DRY RUN"}: ${held} thank-you, ${missed} missed-you, ${skipped} skipped (duplicate or already sent). --send to go.`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error(e);
  await prisma.$disconnect();
  process.exit(1);
});
