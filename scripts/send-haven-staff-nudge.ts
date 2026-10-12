/**
 * The follow-up, three days after the relaunch.
 *
 * Two of nineteen signed in. The reason was partly ours: there was no way to
 * tick a task off, so anybody who did sign in found a list they could not
 * finish. This email says that plainly.
 *
 * Saying it is not a courtesy. The whole programme asks nineteen people to
 * speak up when something is wrong, and the fastest way to teach them that is
 * real is to do it ourselves first, about our own work, unprompted.
 *
 * Short on purpose. A second long email three days after the first is how the
 * first one gets reclassified as noise.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-nudge.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-nudge.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const STAFF_PAGE = "https://www.consultforafrica.com/HavenStaff";
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: that one was our fault, and it is fixed";

interface Staff { firstName: string; lastName: string; email: string; department: string; dataIssue?: string }

const greeting = (s: Staff) => (s.department === "MEDICAL" ? `Dr ${s.firstName}` : s.firstName);

function body(s: Staff) {
  return `Dear ${greeting(s)},

A short one, and an apology first.

When we sent you the staff page on Monday, there was a list of things to do on it and no way to tick any of them off. That was our mistake, not yours. It is fixed as of today.

So if you looked and it seemed pointless, you were right. Please have another go.

  ${STAFF_PAGE}

Sign in with your email and we will text or email you a six-digit code. There is no password.

What is there now: everyone's name, role and number in one place, your own short list for the day that you can actually tick, leave you can ask for from your phone, and a notes board for the team.

The two forms work without signing in and both can be sent with no name on them. One is for something that nearly went wrong. The other is for anything that is broken or wastes your time. We would genuinely rather hear it.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553`;
}

async function main() {
  const roster: Staff[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "docs/data/haven-staff-roster.json"), "utf8")
  ).staff;

  const bad = roster.filter((s) => s.dataIssue?.toLowerCase().includes("bounce"));
  if (bad.length) throw new Error(`Refusing to send, bouncing: ${bad.map((s) => s.email)}`);

  const probe = await fetch(STAFF_PAGE).catch(() => null);
  console.log(`  staff page -> ${probe?.status ?? "unreachable"}`);
  console.log(`  Recipients: ${roster.length}, one each, cc ${CC.join(", ")}`);
  console.log(`  Subject:    ${SUBJECT}\n`);
  console.log(body(roster[0]).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND) { console.log("\n  DRY RUN. Re-run with --send.\n"); return; }
  if (!probe?.ok) throw new Error("Staff page is not live. Refusing to send.");

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set.");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  let sent = 0, failed = 0;
  for (const s of roster) {
    const text = body(s);
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: s.email, name: `${s.firstName} ${s.lastName}` } }],
        cc: CC.map((address) => ({ email_address: { address } })),
        reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
        subject: SUBJECT,
        htmlbody: text.replace(/\n/g, "<br>"),
        textbody: text,
      }),
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) { failed++; console.error(`  FAILED ${s.email}: ${res.status}`); }
    else { sent++; console.log(`  sent ${s.email}`); }
    await new Promise((r) => setTimeout(r, 350));
  }
  console.log(`\n  ${sent} sent, ${failed} failed, of ${roster.length}.`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
