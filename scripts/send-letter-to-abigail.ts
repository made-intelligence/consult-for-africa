/**
 * Sends the apology to Abigail, with the verbatim prompt log appended.
 *
 * Plain formatting on purpose. This is a letter from one person to another and
 * a branded template would make it read like an announcement.
 */
import { readFileSync } from "fs";
import { notifyInternal } from "../lib/email";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const TO = ["abigail.ayomide04@gmail.com", "abigailoladejo04@gmail.com"];

function paras(md: string): string {
  return md
    .split(/\n\s*\n/)
    .map((b) => b.trim())
    .filter(Boolean)
    .map((b) => {
      if (b.startsWith("# ")) return `<h2 style="margin:32px 0 12px;font-size:17px;color:#0F2744;">${b.slice(2)}</h2>`;
      if (b === "---") return `<hr style="border:none;border-top:1px solid #E5E7EB;margin:20px 0;">`;
      if (b.startsWith(">")) {
        const t = b.split("\n").map((l) => l.replace(/^>\s?/, "")).join(" ").trim();
        return `<blockquote style="margin:0 0 14px;padding:10px 16px;border-left:3px solid #D4AF37;background:#FAFAF8;font-size:15px;line-height:1.6;color:#374151;">${t}</blockquote>`;
      }
      const bold = b.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>").replace(/\*(.+?)\*/g, "<em>$1</em>");
      return `<p style="margin:0 0 16px;font-size:15.5px;line-height:1.7;color:#1F2937;">${bold.replace(/\n/g, " ")}</p>`;
    })
    .join("\n");
}

async function main() {
  if (!process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY not set");

  const letter = readFileSync("docs/office/letter-to-abigail.md", "utf-8");
  const appendix = readFileSync("docs/office/letter-to-abigail-appendix.md", "utf-8");

  const subject = letter.split("\n")[0].replace(/^Subject:\s*/, "").trim();
  const body = letter.split("\n").slice(1).join("\n").trim();

  for (const e of TO) {
    const s = await prisma.communicationSuppression.findFirst({ where: { email: e.toLowerCase() }, select: { reason: true } });
    if (s) throw new Error(`${e} is suppressed (${s.reason})`);
  }

  const html = `<div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,sans-serif;max-width:620px;margin:0 auto;padding:8px 4px;">
${paras(body)}
<div style="margin-top:40px;padding-top:4px;border-top:2px solid #0F2744;"></div>
${paras(appendix)}
</div>`;

  for (const to of TO) {
    await notifyInternal(to, subject, html);
    console.log(`sent to ${to}`);
  }
  console.log(`\nsubject: ${subject}`);
}
main().catch((e) => { console.error(String(e instanceof Error ? e.message : e)); process.exitCode = 1; })
  .finally(() => prisma.$disconnect());
