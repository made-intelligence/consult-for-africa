/**
 * One-off, 24 Oct 2026: the digest carried the DFC homepage instead of the
 * Dr Tare Biu event page, so the digest list gets the real link directly.
 *
 *   npx tsx --env-file=.env scripts/send-dfc-catalyst-biu.ts --to you@x.com   # one test
 *   npx tsx --env-file=.env scripts/send-dfc-catalyst-biu.ts --apply          # full list
 */
import { getDigestRecipients } from "@/lib/cadreWeeklyDigest";
import { sendTransactionalEmail } from "@/lib/zeptomail";

const FROM = "Doctors Foundation for Care <hello@consultforafrica.com>";
const REPLY_TO = "secretariat@dfcare.org";
const BASE_URL = "https://consultforafrica.com";
const EVENT_URL = "https://www.dfcare.org/events/dfc-catalyst-series-featuring-dr-tare-biu";
const SUBJECT = "Starting at 12:00 today: Dr Tare Biu on ADHD in children";

function html(id: string) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#f9fafb;font-family:Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:24px 16px;">
<table width="560" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;">
<tr><td style="padding:28px;font-size:15px;line-height:1.6;color:#374151;">
<p style="margin:0 0 16px;">Dear colleague,</p>
<p style="margin:0 0 16px;">The DFC Catalyst Series session starts at 12:00 PM WAT today on Zoom. Dr Tare Biu, Consultant Neurodevelopmental Paediatrician in Bristol, will speak on identifying and managing children with ADHD.</p>
<p style="margin:0 0 16px;">Yesterday's digest linked to the DFC homepage rather than the session. The page with the joining details is below. There is no charge to attend.</p>
<p style="margin:24px 0;"><a href="${EVENT_URL}" style="background:#5B21B6;color:#ffffff;text-decoration:none;padding:12px 20px;border-radius:6px;font-weight:bold;display:inline-block;">Join the session</a></p>
<p style="margin:0;">Debo Odulana<br>Doctors Foundation for Care</p>
</td></tr></table>
<p style="font-size:12px;color:#9ca3af;margin:16px 0 0;"><a href="${BASE_URL}/oncadre/unsubscribe/${id}" style="color:#9ca3af;">Unsubscribe</a></p>
</td></tr></table></body></html>`;
}

function text(id: string) {
  return `Dear colleague,

The DFC Catalyst Series session starts at 12:00 PM WAT today on Zoom. Dr Tare Biu, Consultant Neurodevelopmental Paediatrician in Bristol, will speak on identifying and managing children with ADHD.

Yesterday's digest linked to the DFC homepage rather than the session. The page with the joining details is here, and there is no charge to attend:
${EVENT_URL}

Debo Odulana
Doctors Foundation for Care

Unsubscribe: ${BASE_URL}/oncadre/unsubscribe/${id}`;
}

async function main() {
  const args = process.argv.slice(2);
  const toIdx = args.indexOf("--to");
  const testTo = toIdx >= 0 ? args[toIdx + 1] : null;
  const apply = args.includes("--apply");

  if (testTo) {
    const r = await sendTransactionalEmail({ from: FROM, replyTo: REPLY_TO, to: testTo, subject: SUBJECT, html: html("test"), text: text("test") });
    console.log("test", testTo, r);
    return;
  }
  const recipients = await getDigestRecipients();
  console.log(`Recipients: ${recipients.length}`);
  if (!apply) return;
  let sent = 0, failed = 0;
  for (const p of recipients) {
    if (!p.email) continue;
    const r = await sendTransactionalEmail({ from: FROM, replyTo: REPLY_TO, to: p.email, subject: SUBJECT, html: html(p.id), text: text(p.id) });
    if (r.ok) sent++; else { failed++; console.log("FAIL", p.email, r.error); }
    await new Promise((res) => setTimeout(res, 120));
  }
  console.log(`Sent ${sent}, failed ${failed}`);
}
main().then(() => process.exit(0)).catch((e) => { console.error(e); process.exit(1); });
