/**
 * Asks applicants on the open mandates to send a CV.
 *
 * Twenty-three applications came in across the four live roles and only five of
 * the people behind them have a CV on file, because express-apply collects a
 * name, an email and a phone number and nothing else. Without a CV there is
 * nothing to shortlist from.
 *
 * Two guards worth knowing about:
 *
 * Somebody who applied to more than one role is chased once, naming all of
 * them, rather than receiving an email per application.
 *
 * Somebody who already sent a CV under a second record is not chased at all.
 * One applicant here signed up twice with different addresses and has a CV on
 * one of them; asking him for something he has already sent reads as careless
 * and is exactly the kind of thing that loses a candidate.
 *
 * Run: npx tsx --env-file=.env.local scripts/send-applicant-cv-request.ts --dry
 */
import { PrismaClient } from "@prisma/client";
import { displayNameFor, givenNameFor, surnameFor } from "../lib/cadreSalutation";
import { sendCadreEmail } from "../lib/cadreEmail";

const prisma = new PrismaClient();
const DRY = process.argv.includes("--dry");

/**
 * Where links in these emails point.
 *
 * Deliberately not NEXTAUTH_URL. That is http://localhost:3000 in .env.local,
 * and this script runs from a laptop, so reading it would have put a localhost
 * link in front of sixteen job applicants.
 */
const PUBLIC_BASE = process.env.CADRE_PUBLIC_URL ?? "https://oncadre.com";

/** A loose identity key, to catch the same person signed up twice. */
function identityKey(p: { firstName: string | null; lastName: string | null }): string {
  return [givenNameFor(p.firstName), surnameFor(p.lastName)]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

async function main() {
  if (!process.env.ZEPTOMAIL_API_KEY) {
    throw new Error("ZEPTOMAIL_API_KEY is not set; refusing to fall back to SMTP.");
  }

  const matches = await prisma.cadreMandateMatch.findMany({
    where: { source: "APPLIED", mandate: { status: "OPEN", isPublished: true } },
    orderBy: { createdAt: "asc" },
    select: {
      createdAt: true,
      mandate: { select: { title: true } },
      professional: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          cadre: true,
          cvFileUrl: true,
          passwordHash: true,
        },
      },
    },
  });

  interface Target {
    id: string;
    email: string;
    name: string;
    greeting: string;
    claimed: boolean;
    hasCv: boolean;
    identity: string;
    roles: string[];
  }

  const byPerson = new Map<string, Target>();
  for (const m of matches) {
    const p = m.professional;
    if (!byPerson.has(p.id)) {
      byPerson.set(p.id, {
        id: p.id,
        email: p.email,
        name: displayNameFor(p),
        greeting: givenNameFor(p.firstName) ?? displayNameFor(p),
        claimed: !!p.passwordHash,
        hasCv: !!p.cvFileUrl,
        identity: identityKey(p),
        roles: [],
      });
    }
    const t = byPerson.get(p.id)!;
    if (!t.roles.includes(m.mandate.title)) t.roles.push(m.mandate.title);
  }

  const all = [...byPerson.values()];
  // Anyone whose name already has a CV against it, on any record.
  const identitiesWithCv = new Set(all.filter((t) => t.hasCv && t.identity).map((t) => t.identity));

  const targets = all.filter((t) => !t.hasCv && !identitiesWithCv.has(t.identity));
  const skippedDuplicate = all.filter((t) => !t.hasCv && identitiesWithCv.has(t.identity));

  console.log(`${all.length} applicants | ${all.filter((t) => t.hasCv).length} already sent a CV`);
  console.log(`${targets.length} to chase`);
  for (const s of skippedDuplicate) {
    console.log(`  skipped ${s.name} <${s.email}>: already has a CV on another record`);
  }

  let sent = 0;
  for (const t of targets) {
    const roleList =
      t.roles.length === 1
        ? `the ${t.roles[0]} role`
        : `the ${t.roles.slice(0, -1).join(", ")} and ${t.roles.at(-1)} roles`;

    const body = `${t.greeting}, thank you for applying for ${roleList} through CadreHealth.

To put you forward we need your CV, and we do not have one on file for you yet. Reply to this email with it attached and we will add it to your application.

${
  t.claimed
    ? "You can also upload it to your CadreHealth profile, which saves you sending it again for the next role."
    : "If you would rather keep everything in one place, you can claim your CadreHealth profile and upload it there, which saves you sending it again for the next role."
}

We are reviewing applications as they come in, so the sooner we have it the better. If you have changed your mind about the role, just say so and we will close your application rather than keep chasing you.`;

    if (DRY) {
      console.log(`\n--- ${t.name} <${t.email}>`);
      console.log(body);
      continue;
    }

    try {
      await sendCadreEmail({
        to: t.email,
        subject:
          t.roles.length === 1
            ? `Your application: we need your CV`
            : `Your applications: we need your CV`,
        heading: "We need your CV",
        body,
        ctaText: t.claimed ? "Upload it to your profile" : "Claim your profile",
        // The claim page is /oncadre/claim/<professional id>; there is no bare
        // /oncadre/claim, so sending one would have been a 404 on the only link
        // in the email.
        ctaHref: `${PUBLIC_BASE}${
          t.claimed ? "/oncadre/profile" : `/oncadre/claim/${t.id}`
        }`,
        footer: "Reply to this email with your CV attached if that is easier.",
      });
      sent++;
    } catch (err) {
      console.error(`  FAILED ${t.email}:`, err instanceof Error ? err.message : err);
    }
  }

  if (!DRY) console.log(`\nsent ${sent} of ${targets.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
