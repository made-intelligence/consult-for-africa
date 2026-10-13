/**
 * The Zuri Health roles in Nairobi, to CadreHealth members in the three
 * specialties. Each person is offered the role in their own specialty and
 * asked to pass the other two on.
 *
 * Claimed accounts went first, at Debo's instruction (13 Oct 2026): 402 sent.
 * --unclaimed then reaches the rest of the register in the three specialties,
 * which still carries the bounce rate that got ZeptoMail nervous. It goes in
 * batches of 200 and stops when a batch bounces above 5%, read off the
 * suppressions the ZeptoMail webhook writes.
 *
 * Every link goes to the screening form at /oncadre/kenya, which asks about
 * relocation first. Sends are logged to scripts/out/zuri-kenya-sent.json and
 * skipped on a re-run.
 *
 *   npx tsx --env-file=.env.local scripts/send-cadre-zuri-kenya.ts                 # dry run + preview
 *   npx tsx --env-file=.env.local scripts/send-cadre-zuri-kenya.ts --to=me@x       # one test of each version
 *   npx tsx --env-file=.env.local scripts/send-cadre-zuri-kenya.ts --send          # claimed accounts
 *   npx tsx --env-file=.env.local scripts/send-cadre-zuri-kenya.ts --unclaimed --send   # the rest, in batches
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { salutationFor } from "@/lib/cadreSalutation";

const SEND = process.argv.includes("--send");
const UNCLAIMED = process.argv.includes("--unclaimed");
const BATCH = 200;
const MAX_BOUNCE = 0.05;
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const OUT = path.join(process.cwd(), "scripts/out");
const LOG = path.join(OUT, "zuri-kenya-sent.json");

type Role = "obgyn" | "physician" | "paediatrician";

const ROLES: Record<Role, { title: string; short: string; terms: string; match: (s: string) => boolean }> = {
  obgyn: {
    title: "Consultant Obstetrician and Gynaecologist",
    short: "obstetrician and gynaecologist",
    terms: "You would lead Petals, their women's health service, from antenatal booking through delivery at partner hospitals to postnatal review. A monthly retainer plus a share of consultation, procedure and delivery fees.",
    match: (s) => /obstet|gyna?ec/i.test(s),
  },
  physician: {
    title: "Consultant Physician (Internal Medicine)",
    short: "physician",
    terms: "You would own their chronic care programme for hypertension, diabetes and other NCDs, in clinic and by telemedicine, and train the clinicians who deliver it. Salaried and full time.",
    match: (s) => /internal medicine|cardiolog|endocrin|nephrol|gastroent|infectious|rheumat|neurolog/i.test(s),
  },
  paediatrician: {
    title: "Consultant Paediatrician",
    short: "paediatrician",
    terms: "You would run consultant clinics across their Nairobi sites, take over newborns from their maternity service, and see sick children at home and by telemedicine. Sessional, including Saturday rounds.",
    match: (s) => /pa?ediat|neonat|child health/i.test(s) && !/surg/i.test(s),
  },
};

const roleFor = (sub: string | null): Role | null => (sub ? ((Object.keys(ROLES) as Role[]).find((r) => ROLES[r].match(sub)) ?? null) : null);
const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const link = (role: Role) => `${SITE}/oncadre/kenya?role=${role}&utm_source=cadre&utm_campaign=zuri-kenya-2026-10`;

function render(p: { id: string; firstName: string; lastName: string }, role: Role, member = true) {
  const r = ROLES[role];
  const others = (Object.keys(ROLES) as Role[]).filter((x) => x !== role).map((x) => ROLES[x].short);
  const url = link(role);
  const unsub = `${SITE}/oncadre/unsubscribe/${p.id}`;
  const subject = `A consultant ${r.short} role in Nairobi`;
  const hello = salutationFor(p, { assumeDoctor: true });
  const why = member ? "You are receiving this as a CadreHealth member." : "You are receiving this because you are listed as a specialist on the CadreHealth register.";

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:580px;margin:0 auto;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px;">${esc(hello)}</p>
<p style="margin:0 0 14px;">Zuri Health, a digital health company in Nairobi, has asked us to find a <strong>${esc(r.title)}</strong> who is ready to relocate to Kenya.</p>
<p style="margin:0 0 14px;">${esc(r.terms)}</p>
<p style="margin:0 0 14px;">They want at least three years as a specialist. You would need specialist registration with the Kenya Medical Practitioners and Dentists Council, and if you are not registered we will take you through it.</p>
<p style="margin:0 0 20px;">If you would consider the move, a few questions will tell us whether to put you forward. They take two minutes.</p>
<p style="margin:0 0 24px;"><a href="${esc(url)}" style="display:inline-block;padding:12px 26px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">Tell us if it suits you</a></p>
<p style="margin:0 0 14px;">Zuri are also hiring a consultant ${esc(others[0])} and a consultant ${esc(others[1])}. If a colleague would want to go, forward them this email or reply with their name and number.</p>
<p style="margin:0 0 4px;">With kind regards,</p>
<p style="margin:0;font-weight:600;">Dr Debo Odulana</p>
<p style="margin:2px 0 24px;font-size:13px;color:#6b7280;">Founding Partner, Consult for Africa</p>
<p style="margin:0;font-size:12px;color:#9ca3af;">${why} <a href="${esc(unsub)}" style="color:#6b7280;">Unsubscribe</a>.</p>
</div></body></html>`;

  const text = `${hello}

Zuri Health, a digital health company in Nairobi, has asked us to find a ${r.title} who is ready to relocate to Kenya.

${r.terms}

They want at least three years as a specialist. You would need specialist registration with the Kenya Medical Practitioners and Dentists Council, and if you are not registered we will take you through it.

If you would consider the move, a few questions will tell us whether to put you forward. They take two minutes:
${url}

Zuri are also hiring a consultant ${others[0]} and a consultant ${others[1]}. If a colleague would want to go, forward them this email or reply with their name and number.

With kind regards,
Dr Debo Odulana
Founding Partner, Consult for Africa

${why} Unsubscribe: ${unsub}`;
  return { subject, html, text };
}

function parse(addr: string) {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
}

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set. Bulk mail does not fall back to Zoho.");

  const live = await prisma.cadreMandate.count({ where: { facility: { slug: "zuri-health" }, status: "OPEN", isPublished: true } });
  if (live < 3) throw new Error(`Only ${live} Zuri mandates are live. Run scripts/seed-zuri-health-jobs.ts first; the form needs all three.`);

  fs.mkdirSync(OUT, { recursive: true });
  const sample = { id: "preview", firstName: "Adaeze", lastName: "Okafor" };
  for (const role of Object.keys(ROLES) as Role[]) fs.writeFileSync(path.join(OUT, `zuri-kenya-preview-${role}.html`), render(sample, role).html);

  if (TO) {
    for (const role of Object.keys(ROLES) as Role[]) {
      const { subject, html, text } = render({ id: "test", firstName: "Debo", lastName: "Odulana" }, role);
      const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: TO }], replyTo: parse(FROM), subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
      console.log(role, r.ok ? "sent" : r.error);
    }
    return;
  }

  const members = await prisma.cadreProfessional.findMany({
    where: UNCLAIMED
      ? {
          cadre: "MEDICINE",
          email: { not: { contains: "@cadrehealth.system" } },
          // Prisma's `not` drops NULLs, so "no outreach record" is spelled out.
          OR: [{ outreachRecord: null }, { outreachRecord: { profileClaimedAt: null, status: { notIn: ["UNREACHABLE", "NOT_INTERESTED"] } } }],
        }
      : { cadre: "MEDICINE", outreachRecord: { profileClaimedAt: { not: null } }, email: { not: { contains: "@cadrehealth.system" } } },
    select: { id: true, email: true, firstName: true, lastName: true, subSpecialty: true },
  });
  const suppressed = new Set((await prisma.communicationSuppression.findMany({ select: { email: true } })).map((s) => s.email?.toLowerCase()));
  const sent: { email: string; role: Role; at: string; id?: string }[] = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : [];
  const done = new Set(sent.map((s) => s.email));

  const queue = members
    .map((m) => ({ ...m, role: roleFor(m.subSpecialty) }))
    .filter((m): m is typeof m & { role: Role } => !!m.role && !suppressed.has(m.email.toLowerCase()) && !done.has(m.email.toLowerCase()));

  const byRole = Object.fromEntries((Object.keys(ROLES) as Role[]).map((r) => [r, queue.filter((q) => q.role === r).length]));
  console.log({ pool: UNCLAIMED ? "unclaimed" : "claimed", doctors: members.length, alreadySent: done.size, toSend: queue.length, byRole });

  if (!SEND) {
    console.log("DRY RUN. Previews in scripts/out/zuri-kenya-preview-*.html. Pass --send to send.");
    return;
  }

  let ok = 0;
  const failed: string[] = [];
  let batch: string[] = [];
  let batchStart = new Date();
  for (const m of queue) {
    if (UNCLAIMED && batch.length === BATCH) {
      // Hard bounces reach the webhook within a minute or two.
      await new Promise((res) => setTimeout(res, 180_000));
      const bounced = await prisma.communicationSuppression.count({ where: { reason: "BOUNCED", createdAt: { gte: batchStart }, email: { in: batch } } });
      console.log(`batch of ${batch.length}: ${bounced} bounced (${((bounced / batch.length) * 100).toFixed(1)}%). ${ok} sent so far.`);
      if (bounced / batch.length > MAX_BOUNCE) {
        console.log(`STOPPED: bounce rate above ${MAX_BOUNCE * 100}%. Re-running resumes from here.`);
        break;
      }
      batch = [];
      batchStart = new Date();
    }
    const { subject, html, text } = render(m, m.role, !UNCLAIMED);
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: m.email }], replyTo: parse(FROM), subject, htmlbody: html, textbody: text, trackingTag: "zuri-kenya" });
    if (r.ok) {
      ok++;
      sent.push({ email: m.email.toLowerCase(), role: m.role, at: new Date().toISOString(), id: r.messageId });
      fs.writeFileSync(LOG, JSON.stringify(sent, null, 1));
      batch.push(m.email.toLowerCase());
    } else failed.push(`${m.email}: ${r.error}`);
    await new Promise((res) => setTimeout(res, 300));
  }
  console.log({ sent: ok, failed: failed.length });
  if (failed.length) console.log(failed.join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
