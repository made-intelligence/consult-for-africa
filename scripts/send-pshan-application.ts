/**
 * Debo's application for Chief Executive Officer, Private Sector Health
 * Alliance of Nigeria. PwC Nigeria is running the search.
 *
 *   To:  Oluwafunmbi Akinmulero, PwC Nigeria
 *   Cc:  Debo
 *   Att: the CV and the expression of interest. NOTHING ELSE.
 *
 * Two deliberate departures from the usual client send:
 *
 *   1. The display name is "Dr Debo Odulana", not "Consult For Africa". He is
 *      applying, the firm is not, and a recruiter should not see a company
 *      name in the From line of a personal application. The ADDRESS still
 *      comes from SMTP_FROM, so the sent copy lands in the mailbox he checks.
 *   2. Reply-To is his personal address, because that is the address printed
 *      on the CV and the letter, and replies should land where they point.
 *
 * Dry run by default. Pass --send to deliver.
 *   npx tsx --env-file=.env.local scripts/send-pshan-application.ts --send
 */
import fs from "fs";
import path from "path";

for (const f of [".env", ".env.local"]) {
  const p = path.resolve(process.cwd(), f);
  if (!fs.existsSync(p)) continue;
  for (const line of fs.readFileSync(p, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m && !process.env[m[1]]) {
      let v = m[2].trim();
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
      process.env[m[1]] = v;
    }
  }
}

const TO = ["oluwafunmbi.akinmulero@pwc.com"];
const CC = ["debo.odulana@consultforafrica.com"];
const REPLY_TO = "dodulana@gmail.com";
const FROM_NAME = "Dr Debo Odulana";

/** Explicit allowlist. Nothing internal, nothing client-confidential. */
const ATTACH = [
  ["docs/pshan/debo-odulana-cv.pdf", "Debo-Odulana-CV.pdf"],
  ["docs/pshan/debo-odulana-expression-of-interest.pdf", "Debo-Odulana-Expression-of-Interest.pdf"],
] as const;

const SUBJECT = "Chief Executive Officer, PSHAN: expression of interest from Dr Debo Odulana";

const TEXT = `Dear Ms Akinmulero,

I saw the notice for the PSHAN chief executive role and I would like to be considered. My CV and a letter are attached.

Briefly: I am a doctor who runs hospitals. I was chief executive at Cedarcrest in Abuja until last November, and before that chief innovation and strategy officer at Evercare Lekki. I built Doctoora to 21 states and sold it to Evercare. I now run Consult for Africa, and I am president of the Doctors Foundation for Care.

Why PSHAN rather than another hospital job is in the letter, but the short of it is this. The Adopt-A-Health-Facility Programme has proved the model. The next ten years are about keeping 774 facilities running after the adopting company's budget moves on, and that is operating work, which is what I do.

I am in Lagos and can meet at short notice.

Kind regards,

Dr Debo Odulana
+234 913 813 8553  ·  dodulana@gmail.com  ·  linkedin.com/in/deboodulana`;

const SEND = process.argv.includes("--send");

async function main() {
  const attachments = ATTACH.map(([rel, name]) => {
    if (/PRIVATE|prep|internal|benchmark/i.test(rel)) throw new Error(`REFUSING to attach an internal document: ${rel}`);
    const abs = path.resolve(process.cwd(), rel);
    if (!fs.existsSync(abs)) throw new Error(`Missing ${rel}. Rebuild before sending.`);
    const buf = fs.readFileSync(abs);
    return { content: buf.toString("base64"), mime_type: "application/pdf", name, _kb: Math.round(buf.length / 1024) };
  });

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM ?? "hello@consultforafrica.com";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = { address: (m ? m[2] : fromRaw).trim(), name: FROM_NAME };

  console.log(`
  From:     ${from.name} <${from.address}>
  Reply-To: ${REPLY_TO}
  To:       ${TO.join(", ")}
  Cc:       ${CC.join(", ")}
  Subject:  ${SUBJECT}
  Attach:   ${attachments.map((a) => `${a.name} (${a._kb}KB)`).join("\n            ")}
`);

  if (!SEND) {
    console.log("  DRY RUN. Nothing sent. Encoded and validated OK.\n");
    return;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((address) => ({ email_address: { address } })),
      cc: CC.map((address) => ({ email_address: { address } })),
      reply_to: [{ address: REPLY_TO, name: FROM_NAME }],
      subject: SUBJECT,
      htmlbody: TEXT.replace(/\n/g, "<br>"),
      textbody: TEXT,
      attachments: attachments.map(({ _kb, ...a }) => a),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
