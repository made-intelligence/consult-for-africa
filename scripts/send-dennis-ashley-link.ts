/**
 * Dennis Ashley: send the plan and the private audit link.
 *
 * Two audiences, because they need different things. Neither note reports
 * anything said to us in confidence on the visit:
 *
 *   --audience=principal   Dr Oti and the board. Plan, deck, build-up, the link.
 *   --audience=team        The Administrator and staff. The surveys, nothing commercial.
 *
 * Recipients are the 21 August "Connecting via email" thread: Dr Oti to, the rest cc.
 * Override with --to= and --cc= if the group changes.
 *   npx tsx --env-file=.env.local scripts/send-dennis-ashley-link.ts --audience=principal
 *   ... --send   to actually send. Dry run by default: nothing leaves without --send.
 *
 * Sent via Consult for Africa (ZeptoMail, SMTP_FROM is the sender of record).
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

const arg = (k: string) => process.argv.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3).trim();
const AUDIENCE = (arg("audience") ?? "principal") as "principal" | "team";
if (!["principal", "team"].includes(AUDIENCE)) throw new Error("--audience must be principal or team");

// From the 21 August 2026 introduction thread, "Connecting via email".
const DEFAULT_TO = ["chima.oti@dennisashley.com"];
const DEFAULT_CC = [
  "mamsallah.omisore@dennisashley.com",
  "oge.ilegbune@dennisashley.com",
  "obi.igbokwe@dennisashley.com",
  "ikunna.onwuanibe@dennisashley.com",
];
const list = (v: string | undefined, fallback: string[]) =>
  v === undefined ? fallback : v.split(",").map((s) => s.trim()).filter(Boolean);
const TO = list(arg("to") ?? process.env.DA_TO, DEFAULT_TO);
const CC = list(arg("cc"), DEFAULT_CC);
const SEND = process.argv.includes("--send");

const LINK = "https://www.consultforafrica.com/DennisAshleyProject";
const DOCS = path.resolve(process.cwd(), "docs/dennis-ashley");

const PRINCIPAL_SUBJECT = "Dennis Ashley: the plan, and the one thing I need back";

const PRINCIPAL = `Dear Dr Oti,

Mamsallah wrote in August to put us all in touch and I have been slower coming back than I should have been, for which I apologise. Rather than send another holding note I have put the whole thing together properly. Three documents are attached and there is one link at the end. None of it asks you to decide anything today except a date.

The first is the proposal, and the heart of it is this. We are not proposing to go and find doctors for Dennis Ashley. We would bring a bench that already exists and already sees patients: Paras Orthocare and Osteon in orthopaedics and arthroscopy, Nelia in women's health and regenerative medicine, the Balance Clinic and Sito Metabolic through Cooked Indoors Medical Nutrition, GetSlim in bariatric and general surgery with its own endoscopy lists, and Haven Paediatrics, an established Ikeja practice looking for an Island extension. Urology is next. What none of them has is a premium Island address with room for them, which is exactly what you have.

The second is the revenue build-up, which costs that out month by month from your own rooms, sessions and lists rather than from a growth rate. It assumes no capital and no price rises from either side, and it holds today's trading flat throughout, so we claim credit for nothing that already walks through the door. By month twelve it asks for about nine extra patients on a working day and four endoscopy cases a week. Those are the numbers I would judge it on, rather than the total at the bottom.

The third is the same story in slides, for the board.

One thing I should say plainly rather than leave you to find it. The plan asks the clinic for a single new line of spending, a monthly marketing budget for content and paid media. I have put a working figure in the documents and the real one is set with you, not by us. I am asking openly at the start because a premium clinic at that address should not be waiting to be found, and a presence on social media is not the same thing as a demand engine. It is the cheapest line in the plan and the one everything else depends on.

On the audit, the position is unchanged: it runs at our cost, alongside normal operations, without obligation, and the findings are yours whether or not we proceed. Everything for it now sits on one private page, not listed anywhere:

${LINK}

That page holds the nine items that matter most, so your Administrator knows exactly what to send first, somewhere to upload them straight from the page as many times as you like, and four short surveys for your staff, your patients, the colleagues who refer in, and the board. The surveys need no paperwork at all, which makes them the easiest place to start today. Nothing on the page asks for patient-identifiable data, everything shared is confidential to us and used only for the audit, and it is returned or destroyed if we do not proceed. The mutual NDA is drafted and yours the moment you want it. I did not want it to become the reason nothing moves.

What I am asking for is one thing: a week in October that suits you and the Administrator, so we put the on-site days around your clinic schedule rather than across it. If an endoscopy list is running that week, tell me which day and we will come for it.

Warm regards,

Dr Debo Odulana
Founding Partner and Managing Director, Mezo, a Consult For Africa vehicle
debo.odulana@consultforafrica.com  ·  +234 913 813 8553  ·  mezohealth.com`;

const TEAM_SUBJECT = "Dennis Ashley: the short survey we mentioned when we visited";

const TEAM = `Dear all,

Thank you for the time you gave us when we visited. We learned more from half an hour on the floor than from anything on paper, and this note is the follow-up we promised.

Dennis Ashley is looking at working with Mezo to grow the clinic, and the first step is an audit of how the place actually runs. We have been asked to do that properly, which means hearing from the people who run it rather than only from the numbers.

There are four short surveys on the page below. The one for staff takes about ten minutes.

${LINK}

Two things about the staff survey that matter.

It is anonymous, and the answers come to us rather than to anyone at the clinic. We do not pass on individual responses, and nothing anyone writes is attributed to them. What goes back to the board is the picture across everybody's answers, not anybody's answer.

And it is worth doing honestly. The whole point of asking is to find out what works and what does not on an ordinary busy day, including the things that are awkward to say out loud. A survey everyone fills in politely tells us nothing and changes nothing.

If you see patients, there is also a short one you can pass to them, and if you know doctors who refer in, the referrer survey is worth forwarding to them.

With thanks,

Dr Debo Odulana
Founding Partner and Managing Director, Mezo, a Consult For Africa vehicle
debo.odulana@consultforafrica.com  ·  +234 913 813 8553`;

const SUBJECT = AUDIENCE === "principal" ? PRINCIPAL_SUBJECT : TEAM_SUBJECT;
const TEXT = AUDIENCE === "principal" ? PRINCIPAL : TEAM;

const ATTACH = AUDIENCE === "principal"
  ? ["Mezo_DennisAshley_Plan_R2.pdf", "Mezo_DennisAshley_Revenue_Buildup.pdf", "Mezo_DennisAshley_Plan_Deck.pdf"]
  : [];

function html(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(new RegExp(LINK.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"), `<a href="${LINK}">${LINK}</a>`)
    .replace(/\n/g, "<br>");
}

async function main() {
  if (TO.length === 0) {
    throw new Error(
      `No recipient. Pass --to=<address>[,<address>]. We have no address on file for ${AUDIENCE === "principal" ? "Dr Oti" : "the clinic team"}.`,
    );
  }

  const attachments = ATTACH.map((name) => {
    const p = path.join(DOCS, name);
    if (!fs.existsSync(p)) throw new Error(`Attachment missing: ${p}`);
    return { name, content: fs.readFileSync(p).toString("base64"), mime_type: "application/pdf" };
  });

  // ZeptoMail only. Zoho SMTP throttles and is not a fallback.
  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. Use --env-file=.env.local");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();

  const fromRaw = process.env.SMTP_FROM;
  if (!fromRaw) throw new Error("SMTP_FROM not set. It is the sender of record, so it is not defaulted here.");
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };

  const totalMb = attachments.reduce((n, a) => n + a.content.length, 0) / 1.37e6;
  console.log(`
  Audience: ${AUDIENCE}
  From:     ${from.name ?? ""} <${from.address}>
  To:       ${TO.join(", ")}
  Cc:       ${CC.length ? CC.join(", ") : "(none)"}
  Subject:  ${SUBJECT}
  Link:     ${LINK}
  Attach:   ${attachments.length ? `${attachments.map((a) => a.name).join(", ")}  (~${totalMb.toFixed(1)} MB)` : "none"}
`);

  if (!SEND) {
    console.log("  DRY RUN. Nothing sent. Composed and validated OK.\n");
    console.log(TEXT.split("\n").map((l) => `  | ${l}`).join("\n"));
    console.log(`\n  To send: ... --audience=${AUDIENCE} --to=${TO[0]} --send\n`);
    return;
  }

  const res = await fetch("https://api.zeptomail.com/v1.1/email", {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from,
      to: TO.map((address) => ({ email_address: { address } })),
      ...(CC.length ? { cc: CC.map((address) => ({ email_address: { address } })) } : {}),
      reply_to: [{ address: "debo.odulana@consultforafrica.com", name: "Dr Debo Odulana" }],
      subject: SUBJECT,
      htmlbody: html(TEXT),
      textbody: TEXT,
      ...(attachments.length ? { attachments } : {}),
    }),
  });
  const data: any = await res.json().catch(() => null);
  if (!res.ok) throw new Error(`ZeptoMail ${res.status}: ${JSON.stringify(data)}`);
  console.log("  SENT.", data?.message ?? "");
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; });
