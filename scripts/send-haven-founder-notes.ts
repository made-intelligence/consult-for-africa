/**
 * Send the two documents the Haven founders asked for, 18 Sep 2026.
 *
 *   Dr Odedina  -> his Medical Director note + the two-pager
 *   Other four  -> the two-pager
 *
 * Individual emails, one per founder, cc Debo. Never a bulk To/Cc.
 * ZeptoMail HTTP API only: Zoho SMTP now times out on 465 from this machine.
 *
 * Dry run (default):
 *   npx tsx --env-file=.env.local scripts/send-haven-founder-notes.ts
 * Test to Debo (sends both variants so the copy can be read):
 *   npx tsx --env-file=.env.local scripts/send-haven-founder-notes.ts --test --send
 * Live:
 *   npx tsx --env-file=.env.local scripts/send-haven-founder-notes.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
const TEST = process.argv.includes("--test");

const DEBO = "debo.odulana@consultforafrica.com";
const FROM = { address: "hello@consultforafrica.com", name: "Consult for Africa" };
const SURVEY = "https://www.consultforafrica.com/haven-leadership-survey.html";

const TWO_PAGER = {
  file: "docs/haven-programme-expectations-cfa.pdf",
  name: "Haven Paediatrics - What to Expect Over the Next Six Months.pdf",
};
const MD_NOTE = {
  file: "docs/haven-medical-director-role-cfa.pdf",
  name: "Haven Paediatrics - The Medical Director Through the Programme.pdf",
};

type Founder = { salutation: string; email: string; md?: boolean };
const FOUNDERS: Founder[] = [
  { salutation: "Kabir",      email: "kabir@aurorahills.co" },
  { salutation: "Mrs Alli",   email: "abisodunalli@yahoo.com" },
  { salutation: "Dr Saliu",   email: "shakirahsaliu@gmail.com" },
  { salutation: "Dr Odedina", email: "gbajoodedina@gmail.com", md: true },
  { salutation: "Ogochukwu",  email: "odumogo@gmail.com" },
];

const SUBJECT_ALL = "Haven Paediatrics: what to expect over the next six months";
const SUBJECT_MD  = "Haven Paediatrics: what we need from you, and what to expect";

const shell = (inner: string) =>
  `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.62;` +
  `color:#1F2937;max-width:620px">${inner}` +
  `<p style="margin-top:26px">Warm regards,<br>Debo</p>` +
  `<p style="font-size:13px;color:#6B7280;margin-top:22px;padding-top:14px;` +
  `border-top:1px solid #E5E7EB">Dr Debo Odulana<br>Founding Partner, Consult for Africa<br>` +
  `hello@consultforafrica.com &nbsp;&middot;&nbsp; +234 913 813 8553 &nbsp;&middot;&nbsp; ` +
  `consultforafrica.com</p></div>`;

const bodyAll = (s: string) => shell(`
<p>Dear ${s},</p>
<p>You asked for something short setting out what happens now that the audit and the strategy
are done, so I have written a two-pager and attached it. It covers the six month mandate, what
lands each month from October through to March, who does what between your team and mine, and
the four things the programme needs from the board.</p>
<p>I have been honest in it about the downside as well as the target, because the number the
board set is reached at the February peak rather than held every month, and I would rather you
saw that in writing now than discover it in February.</p>
<p>The one thing worth repeating here is that none of this programme is about fixing your
clinical care. Your families rate you 4.60 out of 5 and your staff rate the safety of the care
they give as very good or excellent in twenty-two cases out of twenty-three. The work is to
build the machinery underneath that so the standard survives growth.</p>
<p>Happy to talk any of it through before the strategy session.</p>`);

const bodyMD = shell(`
<p>Dear Dr Odedina,</p>
<p>You asked what we need from you through this process, and it was the right question to ask,
so I have written you a proper answer rather than a paragraph. It is attached.</p>
<p>The short version is that this programme needs more from you than from anyone else on the
board, for two reasons. Clinical governance rated 1.5 out of 5 in the audit, which is the
lowest rating anywhere in it, and that is the one area that cannot be delegated to operations
or to us because it needs a doctor to own it and sign it. Separately, the growth plan is led by
the neonatal unit, and neonatal referral is a consultant-to-consultant conversation rather than
a marketing exercise, so the commercial plan runs through you as well.</p>
<p>The note sets out the five things we need, what we draft against what you sign, and an
honest estimate of the time it takes, which is close to two days a month weighted towards the
first six weeks.</p>
<p>I have also attached the two-pager going to all five of you on what to expect over the next
six months.</p>
<p>One last thing. You are the only founder who has not completed the direction survey, and it
matters more than it looks, because the four answers so far split two against two on how
ambitious Haven should be and two against two again on whether to build in-house or outsource.
You are the casting vote on both. It takes about twenty minutes:
<a href="${SURVEY}" style="color:#0B3C5D">${SURVEY}</a></p>
<p>I would like a conversation between the two of us before the strategy session so you can
push back on any of this while it is still a draft. I am happy to come to you.</p>`);

function attach(spec: { file: string; name: string }) {
  const p = path.join(process.cwd(), spec.file);
  if (!fs.existsSync(p)) throw new Error(`Missing attachment: ${spec.file}`);
  const buf = fs.readFileSync(p);
  return { name: spec.name, content: buf.toString("base64"), mime_type: "application/pdf" };
}

async function main() {
  const twoPager = attach(TWO_PAGER);
  const mdNote = attach(MD_NOTE);
  console.log(`  ${TWO_PAGER.name}  ${(Buffer.from(twoPager.content, "base64").length / 1024).toFixed(0)} KB`);
  console.log(`  ${MD_NOTE.name}  ${(Buffer.from(mdNote.content, "base64").length / 1024).toFixed(0)} KB\n`);

  const jobs = TEST
    ? [
        { to: DEBO, name: "Debo", subject: `[TEST, board copy] ${SUBJECT_ALL}`,
          html: bodyAll("Kabir"), files: [twoPager], cc: false },
        { to: DEBO, name: "Debo", subject: `[TEST, Dr Odedina copy] ${SUBJECT_MD}`,
          html: bodyMD, files: [mdNote, twoPager], cc: false },
      ]
    : FOUNDERS.map((f) => ({
        to: f.email,
        name: f.salutation,
        subject: f.md ? SUBJECT_MD : SUBJECT_ALL,
        html: f.md ? bodyMD : bodyAll(f.salutation),
        files: f.md ? [mdNote, twoPager] : [twoPager],
        cc: true,
      }));

  console.log(`${TEST ? "TEST" : "LIVE"} mode, ${jobs.length} email(s), ${SEND ? "SENDING" : "DRY RUN"}\n`);
  if (!SEND) {
    jobs.forEach((j) =>
      console.log(`  ${j.to.padEnd(34)} ${j.files.length} attachment(s)  "${j.subject}"`));
    console.log("\nDry run only. Add --send to dispatch.");
    return;
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  for (const j of jobs) {
    const payload: any = {
      from: FROM,
      to: [{ email_address: { address: j.to, name: j.name } }],
      subject: j.subject,
      htmlbody: j.html,
      attachments: j.files,
    };
    if (j.cc) payload.cc = [{ email_address: { address: DEBO, name: "Debo Odulana" } }];

    let res: Response;
    try {
      res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${apiKey}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
      });
    } catch (e: any) {
      const cause = e?.cause?.code ?? e?.cause?.message ?? e?.cause ?? "";
      throw new Error(`[${j.to}] network error: ${e?.message ?? e}${cause ? ` (cause: ${cause})` : ""}`);
    }
    const data: any = await res.json().catch(() => null);
    if (!res.ok) {
      const msg = data?.error?.details?.[0]?.message ?? data?.error?.message ??
                  data?.message ?? `HTTP ${res.status}`;
      throw new Error(`[${j.to}] send failed: ${msg}`);
    }
    console.log(`  Sent to ${j.to}`);
  }
  console.log("\nDone.");
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
