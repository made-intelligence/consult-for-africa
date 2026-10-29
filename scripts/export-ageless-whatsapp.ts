/**
 * The WhatsApp follow-up list for the MedLYFE coordinator, after AGELESS.
 *
 *   npx tsx --env-file=.env.local scripts/export-ageless-whatsapp.ts
 *   python3 scripts/build-ageless-whatsapp-list.py
 *
 * One row per guest who held a place: name, phone, and a wa.me link that opens
 * WhatsApp with their own message and personal link already written. Writes
 * docs/ageless/lists/whatsapp-followup.json, which is gitignored: it holds
 * phone numbers.
 */
import { writeFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { agelessLink } from "@/lib/ageless-followup";

const prisma = new PrismaClient();

function firstNameOf(full: string): string {
  const drop = /^(dr|prof|professor|mrs|mr|ms|miss|chief|barr|engr|sir)\.?$/i;
  const parts = full.trim().split(/\s+/).filter((w) => !drop.test(w));
  const f = parts[0] || full.trim();
  return f === f.toUpperCase() ? f[0] + f.slice(1).toLowerCase() : f;
}

/** Nigerian numbers to 234..., anything already international left as digits. */
function waNumber(raw: string): string | null {
  let d = raw.replace(/[^0-9+]/g, "");
  if (d.startsWith("+")) d = d.slice(1);
  else if (d.startsWith("00")) d = d.slice(2);
  else if (d.startsWith("0") && d.length === 11) d = "234" + d.slice(1);
  else if (d.length === 10 && /^[789]/.test(d)) d = "234" + d;
  return d.length >= 10 ? d : null;
}

async function main() {
  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: { in: ["CONFIRMED", "ATTENDED"] } },
    select: { fullName: true, phone: true, email: true, inviteToken: true },
    orderBy: { fullName: "asc" },
  });
  const responded = new Set(
    (await prisma.auditSurveyResponse.findMany({ where: { survey: "ageless-feedback" }, select: { payload: true } }))
      .map((r) => (r.payload as { guestId?: string }).guestId)
      .filter(Boolean),
  );
  const seen = new Set<string>();
  const out = [];
  for (const r of rows) {
    const key = r.email.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    const first = firstNameOf(r.fullName);
    const link = `${agelessLink("", r.inviteToken)}#feedback`;
    const message =
      `Good afternoon ${first}, thank you for attending AGELESS on Wednesday. ` +
      `We would value your feedback on the evening. It takes about two minutes: ${link}\n\n` +
      `Your souvenir pack includes a MedLYFE voucher. You can book a consultation through the same link, or reply here.\n\n` +
      `Kind regards,\nMedLYFE Wellness and Longevity Centre`;
    const wa = waNumber(r.phone);
    out.push({
      name: r.fullName.trim(),
      phone: r.phone.trim(),
      wa: wa ? `https://wa.me/${wa}?text=${encodeURIComponent(message)}` : null,
      responded: false,
    });
  }
  writeFileSync("docs/ageless/lists/whatsapp-followup.json", JSON.stringify(out, null, 1));
  console.log(`${out.length} guests, ${out.filter((o) => !o.wa).length} without a usable number, ${responded.size} attributed responses`);
  await prisma.$disconnect();
}

main();
