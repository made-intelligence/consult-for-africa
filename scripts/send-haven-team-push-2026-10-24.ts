/**
 * Debo's push to the CFA team on Haven, 24 Oct 2026: what each person owns,
 * by when, and the four numbers we move by next Friday. Internal only.
 * Dr Tanwa and Abigail, cc Ezinne and Debo.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-team-push-2026-10-24.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-team-push-2026-10-24.ts --send
 */
const SEND = process.argv.includes("--send");
const TO = [
  { address: "adebusayogbadebo@gmail.com", name: "Dr Omotanwa Gbadebo" },
  { address: "abigail.ayomide04@gmail.com", name: "Abigail Oladejo" },
];
const CC = ["ogeriorji845@gmail.com", "debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: what we deliver by Friday 30 October";

const TEXT = `Dr Tanwa, Abigail,

Haven is moving, but not fast enough for where we need to be before the season. Sixteen of twenty-two staff have signed in and tasks ticked went from 11 in the first fortnight to 45 this week. That is your work and it shows. The next stage depends on a handful of things only we can unblock, so here is who owns what.

Dr Tanwa

- Formulary: finished and sent to me by Wednesday 28 October. Medbury Pharma needs it before vendor-managed inventory can start, and I want VMI kicked off next week.
- Clinical standards: Dr Odedina to approve the first five by Friday 30 October (crash trolley, handover, drug administration, infection control, admission). Thirty-three are drafted and none is approved, so nobody can study or be tested yet.
- Flags: clear the open queue every morning. There are 74 open. A reminder nobody answers teaches people that skipping costs nothing.
- Morning huddle: get it run and recorded daily, with Chioma leading it. It has not been recorded once.

Abigail

- Sign-ins: sit with each of the six who have never signed in, on shift, by Friday 30 October: Chioma, Moshood, Linda N, Anita, Dumebi and Boluwatife. Anita's email is now corrected. Watch each of them sign in once.
- Ben: get his answer on Toyin and Eniola, and the addresses for the five, by Tuesday.
- The chase: each Monday and Thursday, the list of who has not ticked this week, to Dr Tanwa.
- People work: the realignment table to me by Friday 6 November, as set out in your guide.

Both of you

- A one-page note to me every Friday: what moved, what is stuck, what you need from me.
- Anything blocked, tell me the same day. I will clear it.

The numbers by Friday 30 October

- Staff signed in: 22 of 22 (now 16)
- Tasks ticked in the week: 90 (now 45)
- Clinical standards approved: 5 (now 0)
- Open flags: 0 (now 74)

Hit these and we go to the founders with a hospital that is visibly changing, not a plan.

Thank you both. Call me if anything here is unclear.

Debo

Dr Debo Odulana
Founding Partner, Consult for Africa`;

async function main() {
  console.log(`  To: ${TO.map((t) => t.address).join(", ")}\n  Cc: ${CC.join(", ")}\n  Subject: ${SUBJECT}\n`);
  console.log(TEXT.split("\n").map((l) => `  | ${l}`).join("\n"));
  if (!SEND) { console.log("\n  DRY RUN. Re-run with --send.\n"); return; }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((t) => ({ email_address: t })),
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
      subject: SUBJECT,
      htmlbody: `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;white-space:pre-wrap">${TEXT}</div>`,
      textbody: TEXT,
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log(`\n  SENT. request=${data?.request_id ?? "?"}`);
}
main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
