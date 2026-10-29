/**
 * Kinship nursing mandate: the facility, its two roles, the applicants from the
 * Google Form, and the email that sends each of them the filter questions.
 *
 * The roles are the two Kinship options on CFA's "Nursing Roles Recruitment"
 * form, confirmed by Ivie's brief of 22 Oct 2026: one Kinkeeper (senior RN, three
 * years or more, part time) and two Visiting Nurses (earlier career, full time),
 * all in Lagos, interviews before the end of October. Kinship publishes no pay.
 *
 * The applicants come from the form export, converted to JSON outside the repo
 * because it holds personal data. Each becomes a CadreHealth professional; a
 * Kinship tick also opens an application on that role, carrying the form's
 * answers in the notes, so the team sees everyone before the screen is back.
 *
 *   npx tsx --env-file=.env scripts/kinship-nursing-mandate.ts --seed --file=applicants.json
 *   npx tsx --env-file=.env scripts/kinship-nursing-mandate.ts --file=applicants.json            # dry run + preview
 *   npx tsx --env-file=.env scripts/kinship-nursing-mandate.ts --file=applicants.json --to=x@y   # one test
 *   npx tsx --env-file=.env scripts/kinship-nursing-mandate.ts --file=applicants.json --send
 *
 * Idempotent: the facility is upserted by slug, mandates are matched by title,
 * and sends are logged to scripts/out/kinship-sent.json and skipped on a re-run.
 */
import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { KINSHIP_FACILITY_SLUG, KINSHIP_ROLES, type KinshipRole } from "@/lib/cadreHealth/kinshipScreen";

const SEED = process.argv.includes("--seed");
const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const FILE = process.argv.find((a) => a.startsWith("--file="))?.slice(7);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const OUT = path.join(process.cwd(), "scripts/out");
const LOG = path.join(OUT, "kinship-sent.json");

interface Applicant {
  name: string;
  email: string;
  phone: string;
  state: string;
  areas: string;
  category: string;
  certs: string;
  licence: string;
  years: string;
  employer: string;
  title: string;
  clinical: string;
  homecare: string;
  elderly: string;
  abroad: string;
  roles: string;
  availability: string;
  workType: string;
  start: string;
  salary: string;
  cv: string;
}

const FACILITY = {
  slug: KINSHIP_FACILITY_SLUG,
  name: "Kinship",
  type: "PRIVATE_CLINIC" as const,
  state: "Lagos",
  city: "Lagos",
  website: "https://withkinship.ai",
  description:
    "Kinship helps people look after someone they love in Nigeria, from wherever they live. Families in the UK set up a Kinship Plan: the Kinship care team, a shared record, nurse visits at home and a named Kinkeeper. It is hiring nurses in Lagos through Consult For Africa's CadreHealth recruitment service.",
};

const CHECKS = "A current, verifiable NMCN licence, two professional references and a background check before starting";

// Ivie's brief, 22 Oct 2026, and Kinship's careers pages (withkinship.ai/careers).
const MANDATES: Record<KinshipRole, { title: string; type: "CONTRACT" | "PERMANENT"; minYearsExperience: number; description: string; requiredQualifications: string[]; preferredQualifications: string[] }> = {
  kinkeeper: {
    title: "Kinkeeper, Registered Nurse (part time) - Kinship",
    type: "CONTRACT",
    minYearsExperience: 3,
    description: `One role. Kinship is looking for a senior registered nurse to be the named, accountable Kinkeeper for a group of members in Lagos and the people who support them from abroad.

You will hold each member's care over time: notice changes, decide what matters and triage concerns; be the warm, reassuring contact for supporters abroad; set the standard visiting nurses report to and review their reports before supporters see them; and coordinate doctors, health benefits partners and hospital pathways when needed. In the early days you will also make home visits and help train the first visiting nurses.

Part time, scaling with demand. A mobile role: you travel around Lagos to members' homes and work on Kinship's app day to day. Interviews before the end of October.

This search is run by Consult For Africa on behalf of Kinship. Apply through the short screening form on this page.`,
    requiredQualifications: [
      "Registered Nurse with a valid, verifiable NMCN licence",
      "At least three years' post-registration experience",
      "Comfortable travelling around Lagos to visit members at home",
      "A warm, confident communicator in English, comfortable supporting people based abroad",
      "Sound clinical judgement and an instinct for when to act or escalate",
      "Comfortable using an app and digital tools day to day",
      CHECKS,
    ],
    preferredQualifications: ["Community or home health nursing", "Supporting older people and the people close to them", "Working with clients based abroad", "Familiarity with Nigerian health and care pathways"],
  },
  visiting: {
    title: "Visiting Nurse / Care Worker (full time) - Kinship",
    type: "PERMANENT",
    minYearsExperience: 2,
    description: `Two roles. Kinship is looking for registered nurses earlier in their careers to make scheduled home visits to members in Lagos, across every visit type including companionship and escort.

You will complete the visit report for every visit on Kinship's app, using AI tools, following the agreed procedure; escalate anything flagged for safeguarding or medication straight away; and complete onboarding, including the orientation handbook and clinical training.

Full time, with reliable availability between 8am and 8pm so visits can be scheduled; you will not work the whole window. Employed by Kinship's care partner in Nigeria. Interviews before the end of October.

This search is run by Consult For Africa on behalf of Kinship. Apply through the short screening form on this page.`,
    requiredQualifications: [
      "Registered Nurse with a current NMCN licence in good standing",
      "Two to three years' experience",
      "Reliable availability between 8am and 8pm",
      "Comfortable with technology, including AI tools for visit reporting",
      "Detail oriented, with strong professional and interpersonal communication",
      CHECKS,
    ],
    preferredQualifications: ["Home care, domiciliary or elderly care", "Companionship or escort support"],
  },
};

const rolesTicked = (a: Applicant): KinshipRole[] => {
  if (/all of the above/i.test(a.roles)) return ["kinkeeper", "visiting"];
  return [...(/kinkeeper/i.test(a.roles) ? ["kinkeeper" as const] : []), ...(/visiting/i.test(a.roles) ? ["visiting" as const] : [])];
};

const formNotes = (a: Applicant) =>
  [
    `Google Form, Nursing Roles Recruitment (Oct 2026). Roles ticked: ${a.roles}.`,
    `Licence: ${a.licence}. Experience: ${a.years}. Category: ${a.category}.`,
    `Employer: ${a.employer || "none"}, ${a.title || "none"}.`,
    `Based: ${a.state}. Would work: ${a.areas}.`,
    `Clinical areas: ${a.clinical}.`,
    `Home care: ${a.homecare}. Elderly: ${a.elderly}. Families abroad: ${a.abroad}.`,
    `Availability: ${a.availability}, ${a.workType}, start ${a.start}. Pay asked: ${a.salary}.`,
    `Certifications: ${a.certs || "none"}. CV: ${a.cv}`,
  ].join("\n");

function slugify(text: string, suffix: string) {
  return `${text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "").slice(0, 80)}-${suffix}`;
}

async function seed(applicants: Applicant[]) {
  const facility = await prisma.cadreFacility.upsert({ where: { slug: FACILITY.slug }, update: { description: FACILITY.description, website: FACILITY.website }, create: { ...FACILITY, isVerified: true } });
  const ids = {} as Record<KinshipRole, string>;
  for (const r of KINSHIP_ROLES) {
    const m = MANDATES[r.value];
    let row = await prisma.cadreMandate.findFirst({ where: { title: m.title, facilityId: facility.id } });
    if (!row) {
      row = await prisma.cadreMandate.create({
        data: {
          ...m,
          facilityId: facility.id,
          cadre: "NURSING",
          subSpecialty: r.subSpecialty,
          urgency: "HIGH",
          locationState: "Lagos",
          locationCity: "Lagos",
          status: "OPEN",
          isPublished: true,
          publishedAt: new Date(),
          isPilot: true,
          pilotNotes: "Kinship nursing mandate, 21 Oct 2026. Applicants screened and scored at /oncadre/kinship; Abigail Oladejo runs the search.",
          briefedAt: new Date(),
          sourcingStartedAt: new Date(),
        },
      });
      row = await prisma.cadreMandate.update({ where: { id: row.id }, data: { slug: slugify(m.title, row.id.slice(-6)) } });
      console.log(`created: ${m.title} -> ${SITE}/admin/cadrehealth/mandates/${row.id}`);
    } else {
      // The brief can change after the seed; the latest wording wins.
      row = await prisma.cadreMandate.update({ where: { id: row.id }, data: { description: m.description, requiredQualifications: m.requiredQualifications, preferredQualifications: m.preferredQualifications, minYearsExperience: m.minYearsExperience, locationState: "Lagos", locationCity: "Lagos" } });
      console.log(`updated: ${m.title} -> ${SITE}/admin/cadrehealth/mandates/${row.id}`);
    }
    ids[r.value] = row.id;
  }

  let created = 0;
  let matched = 0;
  for (const a of applicants) {
    let p = await prisma.cadreProfessional.findUnique({ where: { email: a.email } });
    if (!p) {
      const [firstName, ...rest] = a.name.replace(/\s+/g, " ").trim().split(" ");
      p = await prisma.cadreProfessional.create({
        data: { firstName, lastName: rest.join(" "), email: a.email, phone: a.phone, cadre: "NURSING", accountStatus: "UNVERIFIED", availability: "ACTIVELY_LOOKING", state: a.state || null, currentFacility: a.employer && !/^none$/i.test(a.employer) ? a.employer : null },
      });
      created++;
    }
    for (const role of rolesTicked(a)) {
      const key = { mandateId_professionalId: { mandateId: ids[role], professionalId: p.id } };
      if (await prisma.cadreMandateMatch.findUnique({ where: key })) continue;
      await prisma.cadreMandateMatch.create({ data: { mandateId: ids[role], professionalId: p.id, source: "APPLIED", status: "NEW", notes: formNotes(a), matchExplanation: "Awaiting the Kinship screen. Google Form answers are in the notes." } });
      await prisma.cadreMandate.update({ where: { id: ids[role] }, data: { applicationCount: { increment: 1 } } });
      matched++;
    }
  }
  console.log({ applicants: applicants.length, professionalsCreated: created, applicationsOpened: matched });
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const firstName = (name: string) => {
  const n = name.replace(/\s+/g, " ").trim().split(" ")[0];
  return n.charAt(0).toUpperCase() + n.slice(1).toLowerCase();
};

function render(a: { name: string }, id: string, roles: KinshipRole[]) {
  const role = roles.length === 1 ? roles[0] : undefined;
  const url = `${SITE}/oncadre/kinship?ref=${id}${role ? `&role=${role}` : ""}&utm_source=cadre&utm_campaign=kinship-2026-10`;
  const ticked = roles.length
    ? `You applied for ${roles.map((r) => KINSHIP_ROLES.find((x) => x.value === r)!.label).join(" and ")}.`
    : "You applied for home care work with us, and Kinship's roles are close to it, so we are offering you the chance to be considered.";
  const subject = "Your Kinship nursing application: the next step";
  const hello = `Dear ${firstName(a.name)},`;

  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:580px;margin:0 auto;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px;">${esc(hello)}</p>
<p style="margin:0 0 14px;">Thank you for applying through our nursing roles form. ${esc(ticked)}</p>
<p style="margin:0 0 14px;">Kinship helps families in the UK look after someone they love in Lagos, with nurse visits at home and a named Kinkeeper. They are hiring two visiting nurses and one Kinkeeper, all in Lagos. Before we put anyone forward we ask every applicant the same short set of questions, including three situations you would meet on a home visit. It takes about five minutes and your details are filled in for you.</p>
<p style="margin:0 0 24px;"><a href="${esc(url)}" style="display:inline-block;padding:12px 26px;background:#0B3C5D;color:#ffffff;font-weight:600;text-decoration:none;border-radius:8px;">Answer the questions</a></p>
<p style="margin:0 0 14px;">Please answer by Sunday 25 October. Kinship are interviewing before the end of the month, and shortlisted nurses will hear from us early that week.</p>
<p style="margin:0 0 4px;">With kind regards,</p>
<p style="margin:0;font-weight:600;">Abigail Oladejo</p>
<p style="margin:2px 0 24px;font-size:13px;color:#6b7280;">Recruitment, Consult For Africa</p>
<p style="margin:0;font-size:12px;color:#9ca3af;">You are receiving this because you applied through the Consult For Africa nursing roles form.</p>
</div></body></html>`;

  const text = `${hello}

Thank you for applying through our nursing roles form. ${ticked}

Kinship helps families in the UK look after someone they love in Lagos, with nurse visits at home and a named Kinkeeper. They are hiring two visiting nurses and one Kinkeeper, all in Lagos. Before we put anyone forward we ask every applicant the same short set of questions, including three situations you would meet on a home visit. It takes about five minutes and your details are filled in for you:
${url}

Please answer by Sunday 25 October. Kinship are interviewing before the end of the month, and shortlisted nurses will hear from us early that week.

With kind regards,
Abigail Oladejo
Recruitment, Consult For Africa

You are receiving this because you applied through the Consult For Africa nursing roles form.`;
  return { subject, html, text };
}

function parse(addr: string) {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
}

async function main() {
  if (!FILE) throw new Error("Pass --file= with the applicants JSON.");
  const applicants: Applicant[] = JSON.parse(fs.readFileSync(FILE, "utf8"));
  if (SEED) return seed(applicants);
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set.");

  const live = await prisma.cadreMandate.count({ where: { facility: { slug: KINSHIP_FACILITY_SLUG }, status: "OPEN", isPublished: true } });
  if (live < 2) throw new Error("The Kinship mandates are not live. Run with --seed first.");

  const people = await prisma.cadreProfessional.findMany({ where: { email: { in: applicants.map((a) => a.email) } }, select: { id: true, email: true } });
  const idOf = new Map(people.map((p) => [p.email.toLowerCase(), p.id]));

  fs.mkdirSync(OUT, { recursive: true });
  fs.writeFileSync(path.join(OUT, "kinship-preview.html"), render({ name: "Adaeze Okafor" }, "preview", ["kinkeeper"]).html);

  if (TO) {
    // The test links to a real applicant's prefilled form, so the tester sees what they will see.
    const a = applicants.find((x) => rolesTicked(x).length === 1)!;
    const { subject, html, text } = render(a, idOf.get(a.email)!, rolesTicked(a));
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: TO }], replyTo: parse(FROM), subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
    console.log(TO, r.ok ? "sent" : r.error, `(rendered for ${a.name})`);
    return;
  }

  const sent: { email: string; at: string; id?: string }[] = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : [];
  const done = new Set(sent.map((s) => s.email));
  // Only those who ticked a Kinship role. The Mezo-only applicants hear from
  // Mezo, so nobody gets two emails about one application (Debo, 22 Oct 2026).
  const queue = applicants.filter((a) => rolesTicked(a).length && idOf.has(a.email) && !done.has(a.email));
  console.log({ applicants: applicants.length, onRecord: idOf.size, alreadySent: done.size, toSend: queue.length });
  if (!SEND) {
    console.log("DRY RUN. Preview in scripts/out/kinship-preview.html. Pass --send to send.");
    return;
  }

  const failed: string[] = [];
  for (const a of queue) {
    const { subject, html, text } = render(a, idOf.get(a.email)!, rolesTicked(a));
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: a.email }], replyTo: parse(FROM), subject, htmlbody: html, textbody: text, trackingTag: "kinship" });
    if (r.ok) {
      sent.push({ email: a.email, at: new Date().toISOString(), id: r.messageId });
      fs.writeFileSync(LOG, JSON.stringify(sent, null, 1));
    } else failed.push(`${a.email}: ${r.error}`);
    await new Promise((res) => setTimeout(res, 300));
  }
  console.log({ sent: queue.length - failed.length, failed: failed.length });
  if (failed.length) console.log(failed.join("\n"));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
