/**
 * Brief Abigail and Dr Tanwa on the cultural transformation plan.
 *
 * Separate emails rather than one to both, because their jobs are different
 * and a shared brief lets each of them assume the other picked something up.
 *
 * The plan is attached and it is candid: it reports three sign-ins out of
 * nineteen and names our own design faults. Both are CFA, so that is fine, and
 * sending them the sanitised version would teach them to sanitise theirs.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-team-brief.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-team-brief.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const PDF = path.resolve(process.cwd(), "docs/haven-culture-plan-cfa.pdf");
const PAGE = "https://www.consultforafrica.com/HavenStaff";
const CC = ["debo.odulana@consultforafrica.com", "ogeriorji845@gmail.com"];

const COMMON = `Where we are, plainly. Nineteen staff were emailed the page on 6 October and again on 9 October. Three have signed in. Two tasks have been ticked. One near miss and two pulse answers have come in.

That is not a failure of theirs. Part of it was ours: for the first three days there was no way to tick a task off, so anybody who did look found a list they could not finish. That is fixed, and seventeen tasks are now live including seven about how we work with each other rather than what we record.

The number that matters this fortnight is how many of the nineteen have signed in at least once. It is three. By 24 October it needs to be fifteen, and nothing I build moves it. People do.`;

const PEOPLE = [
  {
    name: "Abigail Oladejo",
    greeting: "Abigail",
    email: "abigail.ayomide04@gmail.com",
    role: "the chase",
    body: `${COMMON}

Your part is the chase, and I want to be honest that it is the least glamorous job in the plan and the one it actually depends on. A programme like this fails quietly when nobody is keeping a list of who has not done the thing.

This week, three things.

Keep the list. Who has signed in, who has not, who ticked something and who has not opened it since. I will send you the numbers every Monday; what I need from you is the follow-up on the names behind them.

Book the first peer session for the week of 20 October, at the hospital or on a call, and get a presenter named. One person, one topic, fifteen or twenty minutes. Benedict Ijehon or Chioma Agomuo are the two most likely to say yes first.

Chase nothing clinical. Anything about a protocol, a patient or a clinical decision goes to Dr Tanwa or to Dr Odedina, never from you directly. That is not about seniority, it is that a clinical question answered by the wrong person is how an operations team loses a ward's trust.

If somebody tells you they are not going to use it, that is useful and I want to hear exactly what they said rather than a summary.`,
  },
  {
    name: "Dr Omotanwa Gbadebo",
    greeting: "Dr Omotanwa",
    email: "adebusayogbadebo@gmail.com",
    role: "on site",
    body: `${COMMON}

Your part is the one that actually moves it, and it is smaller than it sounds.

Sit with each person on shift and watch them sign in once. Four minutes each, nineteen people. Not a training session and not announced as one; you are standing next to somebody while they do it for the first time. I have put that at the top of the plan because it is the highest-yield hour in the whole programme and it is the one most likely to get skipped as beneath us. It is not.

Second, the protocols. Thirty-three are in the library with the JCI chapter they belong to, and not one has any content behind it. The documents exist at Haven. Getting them out of Dr Odedina and Dr Shakirah, and getting them approved, is what turns the training half of this from a structure into something people can actually learn from. Nothing we generate reaches a nurse without one of them approving it, which is deliberate.

Third, you are the clinical credibility in this team. Neither Abigail nor I have it with that nursing team and you do. If something in the plan would not survive contact with a real ward, say so now rather than in January.

Your own page is at ${PAGE} and you hold the leadership tier, so you will see the week's numbers and the leave waiting on you as well as your own list.`,
  },
];

async function main() {
  if (!fs.existsSync(PDF)) throw new Error(`Plan not found at ${PDF}`);
  const buf = fs.readFileSync(PDF);

  for (const p of PEOPLE) {
    console.log(`\n  --- ${p.name} <${p.email}>  [${p.role}]`);
    if (!SEND) { console.log(p.body.split("\n").slice(0, 6).map((l) => `  | ${l}`).join("\n")); continue; }
  }
  if (!SEND) { console.log(`\n  DRY RUN. Attachment: ${Math.round(buf.length / 1024)}kb. Re-run with --send.\n`); return; }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set.");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  for (const p of PEOPLE) {
    const text = `Dear ${p.greeting},

${p.body}

The plan is attached. It is internal and it is candid about what we got wrong, which is the standard I would like us to hold on this engagement in both directions.

Consult for Africa
hello@consultforafrica.com`;
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: p.email, name: p.name } }],
        cc: CC.map((address) => ({ email_address: { address } })),
        reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
        subject: "Haven: the cultural transformation plan, and your part in it",
        htmlbody: text.replace(/\n/g, "<br>"),
        textbody: text,
        attachments: [{ content: buf.toString("base64"), mime_type: "application/pdf", name: "Haven-Cultural-Transformation-Plan.pdf" }],
      }),
    });
    const data: any = await res.json().catch(() => null);
    if (!res.ok) console.error(`  FAILED ${p.email}: ${res.status} ${JSON.stringify(data)}`);
    else console.log(`  sent ${p.email} request=${data?.request_id ?? "?"}`);
    await new Promise((r) => setTimeout(r, 400));
  }
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
