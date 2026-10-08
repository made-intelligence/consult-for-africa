/**
 * To the CadreHealth clinician list: the October Catalyst session, Dr Kpaduwa
 * taking referrals, and the evening.
 *
 * Value first. The free session is the reason to open it, the referral note is
 * the reason it was sent, and the evening is the postscript. A list of ten
 * thousand doctors is not a place to lead with an ask.
 *
 * Dry by default:
 *   npx tsx --env-file=.env.local scripts/send-cadre-lyfe-blast.ts
 *   npx tsx --env-file=.env.local scripts/send-cadre-lyfe-blast.ts --limit=25 --send
 *   npx tsx --env-file=.env.local scripts/send-cadre-lyfe-blast.ts --send
 */
import { prisma } from "@/lib/prisma";
import { nextCatalystEvent } from "@/lib/cadreHealth/dfcCatalystEvents";
import { LYFE_EVENT, LYFE_SURGEON } from "@/lib/lyfe";
import { notifyInternal } from "@/lib/email";

const CONSULT_URL = "https://www.consultforafrica.com/lyfe/consult?src=doctor";
const EVENT_URL = "https://www.consultforafrica.com/lyfe?src=doctor";

function body(firstName: string) {
  const ev = nextCatalystEvent();
  const catalyst = ev
    ? `<p style="margin:0 0 14px;"><strong>${esc(ev.topic)}</strong>, with ${esc(ev.speaker)}. ${esc(ev.speakerBio)}</p>
       <p style="margin:0 0 18px;">${esc(ev.when)}, on ${esc(ev.venue)}. <a href="${ev.registerUrl}" style="color:#0B3C5D;font-weight:600;">Register here</a>.</p>`
    : "";

  return `<p style="margin:0 0 14px;">Dear ${esc(firstName)},</p>
    <p style="margin:0 0 14px;">Three things, briefly.</p>

    <p style="margin:0 0 8px;font-weight:700;">The next DFC Catalyst session is free and open to you</p>
    ${catalyst}

    <p style="margin:0 0 8px;font-weight:700;">A plastic surgeon in Lagos taking referrals until early November</p>
    <p style="margin:0 0 14px;">${esc(LYFE_SURGEON.name)} is board certified by the American Board of Plastic Surgery and a Fellow of the American College of Surgeons, both publicly verifiable. She is in the country for a limited period and seeing patients by video.</p>
    <p style="margin:0 0 18px;">She takes body after childbirth, breast surgery including reduction and reconstruction, facial work, and the keloid and scarring cases that are common here and poorly served. If an operation is not the right answer she tells the patient so. <a href="${CONSULT_URL}" style="color:#0B3C5D;font-weight:600;">The details are here</a>, and you are welcome to send someone or to speak to her yourself.</p>

    <p style="margin:0 0 8px;font-weight:700;">An evening on ageing well, ${esc(LYFE_EVENT.date)}</p>
    <p style="margin:0 0 18px;">${esc(LYFE_EVENT_THEME_SAFE)} is a cocktail evening at ${esc(LYFE_EVENT.venueName)} on how metabolic health, hormones, skin and aesthetics come together in the way we age. The room holds ${LYFE_EVENT.places} and a few of those places are kept for clinicians. <a href="${EVENT_URL}" style="color:#0B3C5D;font-weight:600;">Register your interest</a> and we will come back to you either way.</p>

    <p style="margin:0 0 6px;">With kind regards,</p>
    <p style="margin:0;font-weight:600;">Dr Debo Odulana</p>
    <p style="margin:2px 0 0;font-size:13px;color:#667;">Consult for Africa</p>`;
}

const LYFE_EVENT_THEME_SAFE = "Ageless";

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

async function main() {
  const args = process.argv.slice(2);
  const send = args.includes("--send");
  const limit = Number(args.find((a) => a.startsWith("--limit="))?.split("=")[1] ?? 0);

  // Stopped 8 October 2026 at Debo's instruction. Dr Kpaduwa is off the
  // AGELESS stage and this email introduces her as taking referrals. Do not
  // remove this without his say-so.
  if (send) {
    console.error("Stopped by Debo on 8 Oct 2026: this blast introduces Dr Kpaduwa. Refusing to send.");
    process.exit(1);
  }

  const ev0 = nextCatalystEvent();
  if (send && ev0 && ev0.registerUrl === "https://www.dfcare.org") {
    console.error("The Catalyst session has no Zoom link yet, only the site.");
    console.error("Refusing to send: an invitation nobody can act on is worse than none.");
    console.error("Put the real registerUrl in lib/cadreHealth/dfcCatalystEvents.ts first.");
    process.exit(1);
  }

  if (send && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing: the fallback is Zoho and bulk must not go that way.");
    process.exit(1);
  }

  const suppressed = new Set(
    (await prisma.communicationSuppression.findMany({ select: { email: true } }))
      .map((s) => s.email?.toLowerCase())
      .filter((e): e is string => !!e),
  );

  // Converted only. These are the people who answered an email once and then
  // went and claimed a profile, so they are the only ones on this list who
  // have shown they want to hear from us. The other eight thousand have been
  // written to and said nothing, and a cold blast to them buys bounces and
  // complaints rather than referrals.
  const all = await prisma.cadreProfessional.findMany({
    where: { outreachRecord: { profileClaimedAt: { not: null } } },
    select: { id: true, email: true, firstName: true, lastName: true },
  });
  const targets = all.filter((p) => p.email && !suppressed.has(p.email.toLowerCase()));

  console.log(`${all.length} converted, ${suppressed.size} suppressed overall, ${targets.length} mailable.`);
  const batch = limit > 0 ? targets.slice(0, limit) : targets;
  console.log(`${send ? "SENDING" : "DRY RUN"} to ${batch.length}.\n`);

  if (!send) {
    const ev = nextCatalystEvent();
    console.log("Next Catalyst:", ev ? `${ev.speaker} — ${ev.topic} — ${ev.when}` : "none on the books");
    console.log("Sample recipients:", batch.slice(0, 3).map((p) => p.email).join(", "));
    return;
  }

  let ok = 0, failed = 0;
  for (const p of batch) {
    // The name columns are split wrong on this table, so greet plainly rather
    // than confidently wrong. See lib/cadreSalutation.ts for the detail.
    const greeting = "Doctor";
    try {
      await notifyInternal(p.email!, "A session, a surgeon taking referrals, and an evening", body(greeting));
      ok++;
      if (ok % 50 === 0) console.log(`  ${ok} sent`);
    } catch (err) {
      failed++;
      console.error(`  FAILED ${p.email}: ${err instanceof Error ? err.message : err}`);
    }
  }
  console.log(`\nSent ${ok}, failed ${failed}.`);
}

main().catch((e) => { console.error(e); process.exit(1); });
