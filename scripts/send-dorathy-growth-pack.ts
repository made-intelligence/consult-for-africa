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
 * promise a new login or a temporary password. It flags the role instead:
 * the account is CONSULTANT, which does not reach the commercial surfaces the
 * pack asks her to own, and only Debo should change that.
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
type NoteKey = "welcome" | "ratecard";

const NOTE_ARG = process.argv.find((a) => a.startsWith("--note="));
const NOTE: NoteKey = (NOTE_ARG?.split("=")[1] as NoteKey) ?? "welcome";

const SUBJECTS: Record<NoteKey, string> = {
  welcome: "Your growth pack: the firm, the clients, the pipeline and the products",
  ratecard: "The figures now exist, and a revised pack",
};

const OPENINGS_HTML: Record<NoteKey, string> = {
  welcome: `<p>Dorathy,</p>
     <p>Attached is your growth pack. It is thirty six pages, it carries the whole firm, and it is the fastest
        way to see what you are being asked to own, because the commercial shape of this place is not obvious
        from the outside and you would otherwise spend a month inferring it.</p>`,
  ratecard: `<p>Dorathy,</p>
     <p>One addition since the copy I sent you, and it closes the gap you would have hit first. The pack said
        it carried no fees and told you to ask for them. <strong>They now exist on the platform, at
        /finance/rate-card</strong>, built for this role: the published day rates by grade, the recruitment
        position and the one it replaced, the assessment and coaching menu, the five bases of a build and
        operate mandate shown as anchor against walk away, the negotiation doctrine, the terms never to
        concede, and the path to every private concession ladder the firm holds.</p>
     <p>Two calibration points on it matter more than the card itself, because they show what discount has
        actually been given and therefore where the floor really is. Read those before you quote anybody.</p>
     <p>It sits behind the elevated roles rather than behind Finance, because the office reads invoice status
        to chase and sees no rates at all, so <strong>you will not reach it until your role is
        changed</strong>. That is deliberate rather than an oversight: the role change is the grant, and one
        conversation with Debo settles both. Please work from the attached copy, in which sections 1.6 and 2.2
        have been rewritten accordingly.</p>`,
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
     Part Seven covers how we sell and the rules on writing. Part Eight is your first ninety days. The
     appendices carry the directory, a glossary, every route to market on one page, and the standing checklists.</p>
  <p>Three things are time critical and they are flagged in the text rather than left for you to find. The Mezo
     claim links start expiring on <strong>11 October</strong>, which is nine days away, and the measurement in
     section 5.3 is the argument for doing something about it this week. The Pearl Oncology and Osiris Health
     recruitment conversations have both been open since May and both are waiting on us. And the Medlyfe
     evening is on <strong>8 October</strong>, with a guest list nobody has planned what to do with.</p>
  <p>On your access: you have held a platform account since 15 May 2026 under this address, so there is no new
     login to set up. Your role on it is recorded as <strong>Consultant</strong> and your title as Business
     Development Manager, which does not match how the firm's own documents describe you and, more practically,
     does not reach the pipeline and commercial surfaces the pack asks you to run. Section 2.2 sets that out.
     Debo needs to change it himself from the admin area, so raise it in your first conversation.</p>
  <p>Two notes on the pack. It names real clients, real findings and the shape of real deals, so none of it
     leaves the firm in any form. And it deliberately carries no fees, rates or balances, which is a genuine
     constraint on a growth role: section 1.6 tells you where every rate card lives and what the pricing logic
     is, and you should ask Debo directly for the figures you need rather than working around the gap.</p>
  <p>Every number in it was read off the live platform on 2 October, so check anything before you quote it.
     Anything that is wrong or out of date, say so, and it gets corrected rather than worked around.</p>
  <p>With best regards,<br/>Consult for Africa</p>
</div>`;

const OPENINGS_TEXT: Record<NoteKey, string> = {
  welcome: `Dorathy,

Attached is your growth pack. It is thirty six pages, it carries the whole firm, and it is the fastest way to see what you are being asked to own.`,
  ratecard: `Dorathy,

One addition since the copy I sent you, and it closes the gap you would have hit first. The pack said it carried no fees and told you to ask for them. They now exist on the platform, at /finance/rate-card, built for this role: the published day rates by grade, the recruitment position and the one it replaced, the assessment and coaching menu, the five bases of a build and operate mandate shown as anchor against walk away, the negotiation doctrine, the terms never to concede, and the path to every private concession ladder the firm holds.

Two calibration points on it matter more than the card itself, because they show what discount has actually been given and therefore where the floor really is. Read those before you quote anybody.

It sits behind the elevated roles rather than behind Finance, because the office reads invoice status to chase and sees no rates at all, so you will not reach it until your role is changed. That is deliberate rather than an oversight: the role change is the grant, and one conversation with Debo settles both. Please work from the attached copy, in which sections 1.6 and 2.2 have been rewritten accordingly.`,
};

const text = `${OPENINGS_TEXT[NOTE]}

It opens with a letter from Debo. Read Part Four and Part Five first, in that order, and before the rest. Part Four is the pipeline and it is four pages, because there is very little in it: one lead, untouched since 18 September, and four proposals that have been in draft since March, against seventeen clients and twenty one engagements. Part Five is the products, and it is the longest part of the document, because Maarova, CadreHealth and Mezo are built, deployed, full of real data and almost entirely unsold.

Part One is the firm and what we actually sell, Part Two is your role, Part Three is every live client and the growth sitting inside each one, Part Six ranks the growth levers against what they would cost, and Part Seven covers how we sell and the rules on writing. Part Eight is your first ninety days. The appendices carry the directory, a glossary, every route to market on one page, and the standing checklists.

Three things are time critical. The Mezo claim links start expiring on 11 October, nine days away, and the measurement in section 5.3 is the argument for doing something about it this week. The Pearl Oncology and Osiris Health recruitment conversations have both been open since May and both are waiting on us. And the Medlyfe evening is on 8 October, with a guest list nobody has planned what to do with.

On your access: you have held a platform account since 15 May 2026 under this address, so there is no new login to set up. Your role on it is recorded as Consultant and your title as Business Development Manager, which does not match how the firm's own documents describe you and does not reach the pipeline and commercial surfaces the pack asks you to run. Section 2.2 sets that out. Debo needs to change it himself from the admin area, so raise it in your first conversation.

Two notes on the pack. It names real clients, real findings and the shape of real deals, so none of it leaves the firm in any form. And it deliberately carries no fees, rates or balances, which is a genuine constraint on a growth role: section 1.6 tells you where every rate card lives and what the pricing logic is, and you should ask Debo directly for the figures you need rather than working around the gap.

Every number in it was read off the live platform on 2 October, so check anything before you quote it. Anything that is wrong or out of date, say so, and it gets corrected rather than worked around.

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
