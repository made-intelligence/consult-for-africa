/**
 * Where AGELESS actually stands: interest, invitations, confirmations.
 *
 * Read only. Run it as often as you like.
 *
 *   npx tsx --env-file=.env.local scripts/ageless-status.ts
 *   npx tsx --env-file=.env.local scripts/ageless-status.ts --names
 */
import { PrismaClient } from "@prisma/client";
import { LYFE_EVENT, LYFE_INVITERS } from "@/lib/lyfe";

const prisma = new PrismaClient();
const names = process.argv.includes("--names");
const pad = (s: unknown, n: number) => String(s).padEnd(n);

async function main() {
  const where = { intent: "EVENT_RSVP" as const };
  const total = await prisma.lyfeEnquiry.count({ where });

  const stages = await prisma.lyfeEnquiry.groupBy({
    by: ["eventStage"],
    _count: { _all: true },
  });
  const n = (s: string) =>
    stages.find((r) => r.eventStage === s)?._count._all ?? 0;

  const places = Number(LYFE_EVENT.places) || 70;
  const confirmed = n("CONFIRMED");

  console.log(`\nAGELESS  ${LYFE_EVENT.date}  ${LYFE_EVENT.venueName}`);
  console.log(`${places} places\n`);
  console.log(`  interested, not yet invited   ${n("INTERESTED")}`);
  console.log(`  invited, not yet confirmed    ${n("INVITED")}`);
  console.log(`  CONFIRMED                     ${confirmed}`);
  console.log(`  waitlisted                    ${n("WAITLIST")}`);
  console.log(`  declined                      ${n("DECLINED")}`);
  console.log(`  ------------------------------`);
  console.log(`  total event enquiries         ${total}`);
  console.log(`  places still open             ${places - confirmed}\n`);

  const clinicians = await prisma.lyfeEnquiry.count({
    where: { ...where, isClinician: true },
  });
  const extra = await prisma.lyfeEnquiry.aggregate({
    where, _sum: { guestCount: true },
  });
  console.log(`  clinicians among them         ${clinicians}`);
  console.log(`  extra guests pledged          ${extra._sum.guestCount ?? 0}`);

  const bySource = await prisma.lyfeEnquiry.groupBy({
    by: ["utmSource"], where, _count: { _all: true },
  });
  if (bySource.length) {
    console.log(`\nWHO BROUGHT THEM`);
    for (const r of bySource.sort((a, b) => b._count._all - a._count._all)) {
      const who = LYFE_INVITERS.find((i) => i.key === r.utmSource);
      console.log(
        `  ${pad(who?.name ?? r.utmSource ?? "(not attributed)", 26)}` +
        `${r._count._all}${who ? ` of ${who.places}` : ""}`,
      );
    }
    const silent = LYFE_INVITERS.filter(
      (i) => !bySource.some((r) => r.utmSource === i.key),
    );
    if (silent.length) {
      console.log(`\n  nothing yet from: ${silent.map((i) => i.name).join(", ")}`);
    }
  }

  if (names) {
    const rows = await prisma.lyfeEnquiry.findMany({
      where, orderBy: { createdAt: "desc" },
      select: {
        fullName: true, phone: true, eventStage: true, isClinician: true,
        guestCount: true, utmSource: true, createdAt: true,
      },
    });
    console.log(`\nEVERY ROW, newest first`);
    for (const r of rows) {
      console.log(
        `  ${r.createdAt.toISOString().slice(0, 16).replace("T", " ")}  ` +
        `${pad(r.fullName, 26)}${pad(r.eventStage ?? "-", 12)}` +
        `${r.isClinician ? "clinician" : "guest    "} +${r.guestCount ?? 0}  ` +
        `${r.utmSource ?? ""}`,
      );
    }
  }

  const last = await prisma.lyfeEnquiry.findFirst({
    where, orderBy: { createdAt: "desc" }, select: { createdAt: true },
  });
  console.log(
    `\nlast event enquiry: ${last ? last.createdAt.toISOString() : "none yet"}\n`,
  );
}

main().finally(() => prisma.$disconnect());
