/**
 * Create the Aman HMO signing programme on the signing desk (/admin/signings).
 *
 * 150 SLAs were signed before the sprint; the CEO wants 300, standard tariff,
 * no negotiation. The original deadline was 31 October and Debo has asked for
 * it closed out by Monday 30 November 2026, so the weekly targets are 20, 40,
 * 40, 40 and the last 10 on the 30th.
 *
 * The automatic reminder is created OFF. Matthew (the lead) sends it to
 * himself from Settings, reads it, and switches it on. The sender name is the
 * one Matthew confirms with Aman; it is editable on the page.
 *
 * Idempotent: an existing programme for the engagement is left as it is.
 *
 *   npx tsx --env-file=.env.local scripts/seed-aman-signing-programme.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/seed-aman-signing-programme.ts --apply  # write
 */
import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

const AMAN = "cmtqblmd00005vbhvb5r3i75a";

const CHASE_SUBJECT = "{{facility}}: your Aman HMO provider agreement";
const CHASE_BODY = `Dear {{contact}},

We sent {{facility}} the Aman HMO provider agreement and have not yet received the signed copy. A fresh copy is attached.

Signing takes a few minutes. You can return the signed agreement, and the documents on the checklist, from a phone or a computer here:
{{link}}

If anything is holding it up, simply reply to this email and we will sort it out.

Kind regards,
{{sender}}`;

async function main() {
  const apply = process.argv.includes("--apply");
  const host = new URL((process.env.DATABASE_URL ?? "").replace(/^postgres(ql)?:/, "http:")).hostname;
  if (!host.endsWith("pooler.supabase.com")) throw new Error(`Refusing: DATABASE_URL host is ${host}, not the production pooler.`);
  console.log(`DB ${host}  ${apply ? "APPLY" : "dry run"}\n`);

  const existing = await prisma.signingProgramme.findFirst({ where: { engagementId: AMAN } });
  if (existing) return console.log(`Already there: ${existing.name} (${existing.id})`);

  const data = {
    engagementId: AMAN,
    name: "Aman HMO Lagos SLA signings",
    baselineSigned: 150,
    target: 300,
    deadline: new Date("2026-11-30T17:00:00+01:00"),
    weeklyTargets: [
      { start: "2026-11-02", target: 20 },
      { start: "2026-11-09", target: 40 },
      { start: "2026-11-16", target: 40 },
      { start: "2026-11-23", target: 40 },
      { start: "2026-11-30", target: 10 },
    ],
    senderName: "Aman HMO Provider Network",
    chaseEnabled: false,
    chaseDays: [2, 5, 9, 14],
    chaseSubject: CHASE_SUBJECT,
    chaseBody: CHASE_BODY,
  };
  console.log(" - Create", data.name, "baseline", data.baselineSigned, "target", data.target, "chase OFF");
  if (!apply) return;
  const p = await prisma.signingProgramme.create({ data });
  console.log(`Created ${p.id}: /admin/signings/${p.id}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
