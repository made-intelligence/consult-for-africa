/**
 * Email the Business Development and Growth pack to the Director of Business
 * Development and Growth, via ZeptoMail, from hello@ so the send is evidenced
 * in the mailbox Debo actually checks.
 *
 *   npx tsx --env-file=.env.local scripts/send-dorathy-growth-pack.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-dorathy-growth-pack.ts --apply  # send
 *
 * The pack carries no fees, rates or client balances by instruction, so this
 * attachment is safe to put in a mailbox. If that ever changes, this script is
 * the wrong way to deliver it and it should go behind a login.
 *
 * Unlike the Executive Assistant's pack, this recipient already holds a
 * platform account, created 15 May 2026, so the note deliberately does not
 * promise a new login or a temporary password.
 *
 * She is Director of Business Development and Growth and full time from
 * January, while the account still reads CONSULTANT. That is not a defect to
 * chase: the elevated access and the rate card go with the start date, as one
 * act rather than a series of requests, so the note says the record is behind
 * and tells her not to spend time on it. Only Debo changes a role.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const TO = { address: "dorathymichael123@gmail.com", name: "Dorathy Michael" };
const CC = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const REPLY_TO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };

const FILE = join(process.cwd(), "docs", "office", "dorathy-growth-pack-cfa.pdf");
const NAME = "CFA - Business Development and Growth - The Growth Pack.pdf";

/**
 * Only the opening changes between sends, so the variants live in one place
 * keyed by --note. A second copy arriving with a fresh welcome on it reads as a
 * mistake and makes the reader distrust both versions, so a later send says
 * plainly what changed.
 */
type NoteKey = "welcome" | "startdate";

const NOTE_ARG = process.argv.find((a) => a.startsWith("--note="));
const NOTE: NoteKey = (NOTE_ARG?.split("=")[1] as NoteKey) ?? "welcome";

const SUBJECTS: Record<NoteKey, string> = {
  welcome: "Your growth pack: the firm, the clients, the pipeline and the products",
  startdate: "A revised pack, written for a January start",
};

const OPENINGS_HTML: Record<NoteKey, string> = {
  welcome: `<p>Dorathy,</p>
     <p>Attached is your growth pack. It is thirty seven pages, it carries the whole firm, and it is the fastest
        way to see what you are being asked to own, because the commercial shape of this place is not obvious
        from the outside and you would otherwise spend a month inferring it.</p>`,
  startdate: `<p>Dorathy,</p>
     <p>Please work from the attached copy and discard the one from earlier. The version you have was written
        as though you were starting now, and Debo has confirmed you are <strong>full time from
        January</strong>, which changes enough of it to be worth a clean replacement rather than a note.</p>
     <p>Two things are different. <strong>Part Eight has been rewritten and split.</strong> It now separates
        the work that is live before you start and therefore belongs to somebody else for now, the short list
        that is genuinely useful to do between now and January, and the ninety days that begin when you
        arrive. The held list carries dates, including the Mezo claim links on 11 October and the Medlyfe
        evening on the 8th, and its purpose is for a name to go against every line so that you inherit a
        record in January rather than a set of things that quietly passed.</p>
     <p>And the role question has been demoted. You are Director of Business Development and Growth; the
        platform record is simply behind, your access arrives with the start date as one act rather than a
        series of requests, and there is nothing to chase before then. If a page says you do not have access,
        it is the role and not a fault.</p>
     <p>One thing worth saying plainly: the three months are not a gap, they are the only time you will get to
        read this firm from outside it. The most valuable thing in the pack for you right now is not the
        ninety day plan, it is Part Four and Part Five, and the most valuable thing you can send back is where
        you think they are wrong.</p>`,
};

const SUBJECT = SUBJECTS[NOTE];

const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937">
  ${OPENINGS_HTML[NOTE]}
  <p>It opens with a letter from Debo. Read <strong>Part Four and Part Five first</strong>, in that order, and
     before the rest. Part Four is the pipeline and it is four pages, because there is very little in it: one
     lead, untouched since 18 September, and four proposals that have been in draft since March, against
     seventeen clients and twenty one engagements. Part Five is the products, and it is the longest part of the
     document, because Maarova, CadreHealth and Mezo are built, deployed, full of real data and almost entirely
     unsold.</p>
  <p>Part One is the firm and what we actually sell, Part Two is your role, Part Three is every live client and
     the growth sitting inside each one, Part Six ranks the growth levers against what they would cost, and
     Part Seven covers how we sell and the rules on writing. Part Eight separates what is held until January
     from your first ninety days after it. The appendices carry the directory, a glossary, every route to
     market on one page, and the standing checklists.</p>
  <p>Section 8.3 is the short list of what is worth doing before you start, and it is deliberately short. The
     one line on it that matters most is agreeing with Debo who holds each dated item in 8.2, because an
     unowned deadline does not announce itself and the alternative is inheriting work in January that already
     failed.</p>
  <p>Two notes on the pack. It names real clients, real findings and the shape of real deals, so none of it
     leaves the firm in any form. And it deliberately carries no fees, rates or balances, because a document
     travels in a way a login does not: section 1.6 says where the figures are and when they open for you,
     which is January, with the rest of your access.</p>
  <p>Every number in it was read off the live platform on 2 October, which is three months before you start, so
     Part Five in particular is a snapshot of something moving and should be re read off the platform when you
     arrive. Anything that is wrong or out of date, say so, and it gets corrected rather than worked around.</p>
  <p>With best regards,<br/>Consult for Africa</p>
</div>`;

const OPENINGS_TEXT: Record<NoteKey, string> = {
  welcome: `Dorathy,

Attached is your growth pack. It is thirty seven pages, it carries the whole firm, and it is the fastest way to see what you are being asked to own.`,
  startdate: `Dorathy,

Please work from the attached copy and discard the one from earlier. The version you have was written as though you were starting now, and Debo has confirmed you are full time from January, which changes enough of it to be worth a clean replacement rather than a note.

Two things are different. Part Eight has been rewritten and split. It now separates the work that is live before you start and therefore belongs to somebody else for now, the short list that is genuinely useful to do between now and January, and the ninety days that begin when you arrive. The held list carries dates, including the Mezo claim links on 11 October and the Medlyfe evening on the 8th, and its purpose is for a name to go against every line so that you inherit a record in January rather than a set of things that quietly passed.

And the role question has been demoted. You are Director of Business Development and Growth; the platform record is simply behind, your access arrives with the start date as one act rather than a series of requests, and there is nothing to chase before then. If a page says you do not have access, it is the role and not a fault.

One thing worth saying plainly: the three months are not a gap, they are the only time you will get to read this firm from outside it. The most valuable thing in the pack for you right now is not the ninety day plan, it is Part Four and Part Five, and the most valuable thing you can send back is where you think they are wrong.`,
};

const text = `${OPENINGS_TEXT[NOTE]}

It opens with a letter from Debo. Read Part Four and Part Five first, in that order, and before the rest. Part Four is the pipeline and it is four pages, because there is very little in it: one lead, untouched since 18 September, and four proposals that have been in draft since March, against seventeen clients and twenty one engagements. Part Five is the products, and it is the longest part of the document, because Maarova, CadreHealth and Mezo are built, deployed, full of real data and almost entirely unsold.

Part One is the firm and what we actually sell, Part Two is your role, Part Three is every live client and the growth sitting inside each one, Part Six ranks the growth levers against what they would cost, and Part Seven covers how we sell and the rules on writing. Part Eight separates what is held until January from your first ninety days after it. The appendices carry the directory, a glossary, every route to market on one page, and the standing checklists.

Section 8.3 is the short list of what is worth doing before you start, and it is deliberately short. The one line on it that matters most is agreeing with Debo who holds each dated item in 8.2, because an unowned deadline does not announce itself and the alternative is inheriting work in January that already failed.

Two notes on the pack. It names real clients, real findings and the shape of real deals, so none of it leaves the firm in any form. And it deliberately carries no fees, rates or balances, because a document travels in a way a login does not: section 1.6 says where the figures are and when they open for you, which is January, with the rest of your access.

Every number in it was read off the live platform on 2 October, which is three months before you start, so Part Five in particular is a snapshot of something moving and should be re read off the platform when you arrive. Anything that is wrong or out of date, say so, and it gets corrected rather than worked around.

With best regards,
Consult for Africa`;

async function main() {
  const apply = process.argv.includes("--apply");
  if (NOTE !== "welcome") console.log(`NOTE MODE: ${NOTE}. The opening says plainly what changed since the first copy.`);
  if (!existsSync(FILE)) throw new Error(`Not found: ${FILE}. Run python3 scripts/build-office-onboarding.py dorathy first.`);

  const buf = readFileSync(FILE);
  console.log(`Attachment: ${NAME} (${Math.round(buf.length / 1024)} KB)`);
  console.log(`From:     ${FROM.name} <${FROM.address}>`);
  console.log(`To:       ${TO.name} <${TO.address}>`);
  console.log(`Cc:       ${CC.name} <${CC.address}>`);
  console.log(`Reply-To: ${REPLY_TO.name} <${REPLY_TO.address}>`);
  console.log(`Subject:  ${SUBJECT}`);

  // The pack must not carry commercials into a mailbox. Assert against the
  // markdown source rather than the PDF, because a PDF's compressed streams
  // produce byte sequences that look like figures and never are. Then assert
  // the PDF is newer than the source, so a stale build cannot be sent.
  const srcPath = FILE.replace(/\.pdf$/, ".md");
  const src = readFileSync(srcPath, "utf8");
  const leaked = src.match(/N[0-9][0-9,.]*/g);
  if (leaked) throw new Error(`Source carries figures (${leaked.slice(0, 3).join(", ")}). Guard them before sending.`);
  const dashes = src.match(/—/g);
  if (dashes) throw new Error(`Source carries ${dashes.length} em dash(es). House rule: none, anywhere.`);
  if (statSync(FILE).mtimeMs < statSync(srcPath).mtimeMs) {
    throw new Error("The PDF is older than its source. Run python3 scripts/build-office-onboarding.py dorathy first.");
  }

  if (!apply) {
    console.log("\nDRY RUN. Re-run with --apply to send.");
    return;
  }

  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (!key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");

  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Zoho-enczapikey ${key}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify({
      from: FROM,
      to: [{ email_address: TO }],
      cc: [{ email_address: CC }],
      reply_to: [REPLY_TO],
      subject: SUBJECT,
      htmlbody: html,
      textbody: text,
      attachments: [{ name: NAME, content: buf.toString("base64"), mime_type: "application/pdf" }],
    }),
  });
  const data = (await res.json().catch(() => null)) as any;
  if (!res.ok) {
    const msg = data?.error?.details?.[0]?.message ?? data?.error?.message ?? data?.message ?? `HTTP ${res.status}`;
    throw new Error(`ZeptoMail send failed: ${msg}`);
  }
  console.log(`\nSent. request_id=${data?.request_id ?? "?"} message_id=${data?.data?.[0]?.message_id ?? "?"}`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
