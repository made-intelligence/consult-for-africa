/**
 * Email the Office of the Founding Partner onboarding pack to the incoming
 * Executive Assistant, via ZeptoMail, from hello@ so the send is evidenced in
 * the mailbox Debo actually checks.
 *
 *   npx tsx --env-file=.env.local scripts/send-ezinne-onboarding-pack.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ezinne-onboarding-pack.ts --apply  # send
 *
 * The pack carries no fees, balances or client commercials by instruction, so
 * this attachment is safe to put in a mailbox. If that ever changes, this
 * script is the wrong way to deliver it and it should go behind a login.
 */

import { readFileSync, existsSync, statSync } from "node:fs";
import { join } from "node:path";

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const TO = { address: "ogeriorji845@gmail.com", name: "Ezinne Orji" };
const CC = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const REPLY_TO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };

const FILE = join(process.cwd(), "docs", "office", "ezinne-onboarding-pack-cfa.pdf");
const NAME = "CFA - Office of the Founding Partner - Onboarding Pack.pdf";

const SUBJECT = "Your onboarding pack, and your platform account";

const html = `
<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1f2937">
  <p>Ezinne,</p>
  <p>Welcome, and congratulations. Attached is your onboarding pack. It is twenty seven pages and it is the
     fastest way to understand what you have joined, because the shape of this firm is not obvious from the
     outside and you would otherwise spend a month working it out by inference.</p>
  <p>It opens with a letter from Debo. After that, Parts One to Three cover the firm, your role and the
     platform, Part Four is Abuja and is the longest part because that is where you are based and where the
     work that is starting sits, and Parts Five to Seven are the reference you will come back to.</p>
  <p>Read Parts One to Three first, then Part Four before the end of the week. Part Eight sets out your first
     ninety days, and the same list is already waiting on your desk on the platform as tasks, each with a brief
     and a definition of done, which is the standard this office works to in both directions.</p>
  <p>Your platform account is live. A separate email from us carries your temporary password, and you should
     change it at your first login from Settings. You sign in at
     <a href="https://www.consultforafrica.com/login" style="color:#0B3C5D">www.consultforafrica.com/login</a>
     and you will land on your desk.</p>
  <p>Two notes on the pack. It names real clients and real findings, so none of it leaves the firm in any form.
     And it deliberately carries no fees or balances: those live on the platform under Invoices, which your role
     reaches, and reading them there is the only way to be sure they are current.</p>
  <p>Anything in it that is wrong or out of date, say so, and it gets corrected rather than worked around.</p>
  <p>With best regards,<br/>Consult for Africa</p>
</div>`;

const text = `Ezinne,

Welcome, and congratulations. Attached is your onboarding pack. It is twenty seven pages and it is the fastest way to understand what you have joined.

It opens with a letter from Debo. Parts One to Three cover the firm, your role and the platform. Part Four is Abuja and is the longest part, because that is where you are based and where the work that is starting sits. Parts Five to Seven are the reference you will come back to.

Read Parts One to Three first, then Part Four before the end of the week. Part Eight sets out your first ninety days, and the same list is already on your desk on the platform as tasks, each with a brief and a definition of done.

Your platform account is live. A separate email carries your temporary password, and you should change it at your first login from Settings. Sign in at https://www.consultforafrica.com/login and you will land on your desk.

Two notes. The pack names real clients and real findings, so none of it leaves the firm in any form. And it deliberately carries no fees or balances: those live on the platform under Invoices, which your role reaches.

Anything in it that is wrong or out of date, say so, and it gets corrected rather than worked around.

With best regards,
Consult for Africa`;

async function main() {
  const apply = process.argv.includes("--apply");
  if (!existsSync(FILE)) throw new Error(`Not found: ${FILE}. Run python3 scripts/build-office-onboarding.py first.`);

  const buf = readFileSync(FILE);
  const kb = Math.round(buf.length / 1024);
  console.log(`Attachment: ${NAME} (${kb} KB)`);
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
  if (statSync(FILE).mtimeMs < statSync(srcPath).mtimeMs) {
    throw new Error("The PDF is older than its source. Run python3 scripts/build-office-onboarding.py first.");
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
