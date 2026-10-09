/**
 * Send every open CadreHealth mandate to every platform consultant.
 *
 *   npx tsx --env-file=.env.local scripts/send-cadre-mandates-to-consultants.ts            # dry run, writes a preview
 *   npx tsx --env-file=.env.local scripts/send-cadre-mandates-to-consultants.ts --to=me@x  # one test copy
 *   npx tsx --env-file=.env.local scripts/send-cadre-mandates-to-consultants.ts --send     # everyone
 *
 * ZeptoMail only: refuses to run without ZEPTOMAIL_API_KEY rather than fall
 * back to Zoho SMTP, which throttles batches. Sent as SMTP_FROM (hello@) so
 * replies land in the inbox Debo reads. Suppressed addresses are skipped.
 * Every send is appended to scripts/out/cadre-mandates-consultants-sent.json
 * and skipped on a re-run, so a broken run can simply be run again.
 */

import fs from "node:fs";
import path from "node:path";
import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";

const SEND = process.argv.includes("--send");
const TO = process.argv.find((a) => a.startsWith("--to="))?.slice(5);
const SITE = "https://www.consultforafrica.com";
const FROM = process.env.SMTP_FROM ?? "Consult For Africa <hello@consultforafrica.com>";
const LOG = path.join(process.cwd(), "scripts/out/cadre-mandates-consultants-sent.json");

const TYPE: Record<string, string> = { PERMANENT: "Permanent", CONTRACT: "Contract", LOCUM: "Locum", CONSULTING: "Consulting", INTERNATIONAL: "International" };

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function salary(min: number | null, max: number | null): string | null {
  const f = (v: number) => (v >= 1_000_000 ? `N${(v / 1_000_000).toFixed(1).replace(/\.0$/, "")}m` : `N${Math.round(v / 1000)}k`);
  if (!min && !max) return null;
  if (min && max) return min === max ? `${f(min)} a month` : `${f(min)} to ${f(max)} a month`;
  return min ? `From ${f(min)} a month` : `Up to ${f(max!)} a month`;
}

/** "obinna  Isiguzo" and "kevin NJiru" become "Obinna Isiguzo" and "Kevin Njiru"; "Bill-Erich" and "Dr" are left alone. */
function tidyName(raw: string): string {
  const word = (w: string) => w.split("-").map((p) => (p === p.toLowerCase() || /^[A-Z]{2}[a-z]/.test(p) ? p.charAt(0).toUpperCase() + p.slice(1).toLowerCase() : p)).join("-");
  return raw.trim().split(/\s+/).map(word).join(" ");
}

function parse(addr: string) {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
}

async function main() {
  if ((SEND || TO) && !process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set. This will not fall back to SMTP.");

  const mandates = await prisma.cadreMandate.findMany({
    where: { status: { in: ["OPEN", "SOURCING"] }, isPublished: true, slug: { not: null } },
    orderBy: [{ urgency: "desc" }, { createdAt: "desc" }],
    select: { title: true, slug: true, type: true, locationCity: true, isRemoteOk: true, salaryRangeMin: true, salaryRangeMax: true, facilityName: true, facility: { select: { name: true } } },
  });
  if (!mandates.length) throw new Error("No open, published mandates");

  const items = mandates.map((m) => {
    const where = m.isRemoteOk ? "Remote" : m.locationCity ? `${m.locationCity}, Lagos` : "Lagos";
    const bits = [m.facility?.name ?? m.facilityName, where, TYPE[m.type] ?? m.type, salary(m.salaryRangeMin ? Number(m.salaryRangeMin) : null, m.salaryRangeMax ? Number(m.salaryRangeMax) : null)].filter(Boolean);
    return { title: m.title, meta: bits.join("  ·  "), url: `${SITE}/oncadre/jobs/${m.slug}` };
  });

  const n = items.length;
  const words = ["no", "one", "two", "three", "four", "five", "six", "seven", "eight", "nine", "ten", "eleven", "twelve"];
  const count = n <= 12 ? words[n] : String(n);
  const subject = `${count[0].toUpperCase()}${count.slice(1)} roles we are recruiting for`;

  const render = (name: string) => {
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:580px;margin:0 auto;font-size:15px;line-height:1.6;">
<p style="margin:0 0 14px;">Dear ${esc(name)},</p>
<p style="margin:0 0 14px;">We are recruiting for ${count} roles through CadreHealth at the moment. One of them may suit you, and you will know people who would suit the others.</p>
${items.map((i) => `<div style="margin:0 0 12px;padding:12px 14px;border:1px solid #e5e7eb;border-left:3px solid #D4AF37;border-radius:8px;">
<a href="${esc(i.url)}" style="color:#0B3C5D;font-weight:600;text-decoration:none;">${esc(i.title)}</a>
<div style="font-size:13px;color:#6b7280;margin-top:2px;">${esc(i.meta)}</div></div>`).join("\n")}
<p style="margin:18px 0 14px;">If someone comes to mind, forward them the link, or reply with their name and how to reach them and we will take it from there.</p>
<p style="margin:0 0 4px;">Debo</p>
<p style="margin:0;font-size:13px;color:#6b7280;">Dr Debo Odulana, Founding Partner, Consult for Africa</p>
</div></body></html>`;
    const text = `Dear ${name},\n\nWe are recruiting for ${count} roles through CadreHealth at the moment. One of them may suit you, and you will know people who would suit the others.\n\n${items.map((i) => `${i.title}\n${i.meta}\n${i.url}`).join("\n\n")}\n\nIf someone comes to mind, forward them the link, or reply with their name and how to reach them and we will take it from there.\n\nDebo\nDr Debo Odulana, Founding Partner, Consult for Africa`;
    return { html, text };
  };

  fs.mkdirSync(path.dirname(LOG), { recursive: true });
  fs.writeFileSync(path.join(path.dirname(LOG), "cadre-mandates-consultants-preview.html"), render("Colleague").html);

  if (TO) {
    const { html, text } = render("Debo");
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: TO }], subject: `[TEST] ${subject}`, htmlbody: html, textbody: text });
    console.log("test", TO, r.ok ? "sent" : r.error);
    return;
  }

  const users = await prisma.user.findMany({ where: { role: "CONSULTANT" }, select: { email: true, name: true } });
  const emails = users.map((u) => u.email.toLowerCase());
  const suppressed = new Set((await prisma.communicationSuppression.findMany({ where: { email: { in: emails } }, select: { email: true } })).map((s) => s.email!.toLowerCase()));
  const sent: { email: string; at: string; id?: string }[] = fs.existsSync(LOG) ? JSON.parse(fs.readFileSync(LOG, "utf8")) : [];
  const done = new Set(sent.map((s) => s.email));
  const queue = users.filter((u) => !suppressed.has(u.email.toLowerCase()) && !done.has(u.email.toLowerCase()));

  console.log({ mandates: n, consultants: users.length, suppressed: suppressed.size, alreadySent: done.size, toSend: queue.length, subject });
  if (!SEND) {
    console.log("DRY RUN. Preview written to scripts/out/cadre-mandates-consultants-preview.html. Pass --send to send.");
    return;
  }

  let ok = 0;
  const failed: string[] = [];
  for (const u of queue) {
    const name = tidyName(u.name ?? "") || "Colleague";
    const { html, text } = render(name);
    const r = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: u.email, name }], replyTo: parse(FROM), subject, htmlbody: html, textbody: text });
    if (r.ok) {
      ok++;
      sent.push({ email: u.email.toLowerCase(), at: new Date().toISOString(), id: r.messageId });
      fs.writeFileSync(LOG, JSON.stringify(sent, null, 1));
    } else failed.push(`${u.email}: ${r.error}`);
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
