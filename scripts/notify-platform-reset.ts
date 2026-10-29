/**
 * Sends the reset briefing. Run once, after the reset has been applied.
 *
 *   npx tsx --env-file=.env.local scripts/notify-platform-reset.ts --send
 */
import { PrismaClient } from "@prisma/client";
import { emailPlatformResetBriefing } from "../lib/email";

const prisma = new PrismaClient();
const SEND = process.argv.includes("--send");

const RECIPIENTS = [
  { id: "cmmte5htc000bybewb4cc3dvh", variant: "engagement-manager" as const },
  { id: "cmtx00rvv0000wqbtbp68pe4f", variant: "intake" as const },
  { id: "cmupss8n80000ma2h80hrdl50", variant: "sweep" as const },
];

async function main() {
  for (const r of RECIPIENTS) {
    const u = await prisma.user.findUnique({ where: { id: r.id }, select: { name: true, email: true } });
    if (!u) { console.log(`  missing user ${r.id}`); continue; }
    console.log(`  ${SEND ? "sending" : "would send"} [${r.variant}] to ${u.name} <${u.email}>`);
    if (!SEND) continue;
    await emailPlatformResetBriefing({ toEmail: u.email, toName: u.name.replace(/^Dr\.? /, "Dr "), variant: r.variant });
  }
  console.log(SEND ? "SENT" : "DRY RUN, nothing sent. Re-run with --send");
}

main().finally(() => prisma.$disconnect());
