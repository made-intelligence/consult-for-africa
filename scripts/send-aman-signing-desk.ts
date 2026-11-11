/**
 * Tell the Aman sprint team the sprint now runs on the signing desk
 * (/sprints/aman), and how to work it. Same recipients as the sprint kickoff:
 * Matthew, Gidado, Ruth and Favour, with Dr Okeleye, Ezinne and Debo copied.
 * Via ZeptoMail from hello@, replies to Matthew. Send only after the desk is
 * live: the migration, scripts/seed-aman-sprint.ts and the deploy.
 *
 *   npx tsx --env-file=.env.local scripts/send-aman-signing-desk.ts           # dry run
 *   npx tsx --env-file=.env.local scripts/send-aman-signing-desk.ts --test    # to Debo only, TEST: subject
 *   npx tsx --env-file=.env.local scripts/send-aman-signing-desk.ts --apply   # send, after Debo approves the test
 */

const ZEPTO_ENDPOINT = "https://api.zeptomail.com/v1.1/email";
const FROM = { address: "hello@consultforafrica.com", name: "Consult For Africa" };
const MATTHEW = { address: "matthew.aloba@consultforafrica.com", name: "Matthew Aloba" };
const GIDADO = { address: "gidadosulaiman2@gmail.com", name: "Muhammad Gidado Sulaiman" };
const RUTH = { address: "ruthpelumi04@gmail.com", name: "Ruth Oladejo" };
const FAVOUR = { address: "soromidayo101@gmail.com", name: "Favour Aina" };
const OKELEYE = { address: "adediwura.okeleye@consultforafrica.com", name: "Dr Adediwura Okeleye" };
const EZINNE = { address: "ogeriorji845@gmail.com", name: "Ezinne Orji" };
const DEBO = { address: "debo.odulana@consultforafrica.com", name: "Debo Odulana" };
const DEBO_PERSONAL = { address: "dodulana@gmail.com", name: "Debo Odulana" };
const DESK = "https://www.consultforafrica.com/sprints/aman";

const NOTE = `Matthew, Gidado, Ruth and Favour,

From Thursday 12 November the Aman sprint runs on the platform instead of the spreadsheet. Sign in and open Sprints in your menu:
${DESK}

What is on it
- 358 Lagos providers from Aman's list, none of them signed. Favour checked them against Aman's signed list, and the eight already signed are out.
- Each provider is on one list, by area: Ruth, Island and Lekki (120); Favour, Mainland north (119); Gidado, Mainland west (119). Hospitals and clinics come first.
- Earlier contact with these providers reached the front desk only, so ask for the MD by name.

How to work it
1. Open My queue. It shows what is due today, then fresh providers. Work down it.
2. Tap a provider. Call or WhatsApp from the page; the WhatsApp message is written for you and carries the hospital's own link.
3. Tap what happened. The desk sets the next step and its date, including each step of the SLA chase in the brief.
4. Save who signs, and write down what they said in their own words. Tick anything they mentioned, such as HMOs paying late.
5. At 5pm, copy your check-in from the bottom of My queue into the day's check-in task.

Every provider has its own page, with no login. From it the hospital says yes and names who signs, downloads the agreement, and sends back the signed copy and the documents from a phone. Each of those shows on the desk the moment it happens, and the owner gets an email. Send the link by WhatsApp or email from the provider's page.

The Board shows the team's numbers, each week against its target, anything escalated to Gidado, and what providers are saying. Gidado copies the 6pm roll-up from it.

Your task for this week is on your desk. Gidado's first job is to move the shared tracker's live pipeline onto the desk by Thursday evening, with the real dates, so the chases and the count are right.

Questions to Gidado, or reply to this email.

With best regards,
Consult for Africa`;

const SEND = {
  to: [MATTHEW, GIDADO, RUTH, FAVOUR],
  cc: [OKELEYE, EZINNE, DEBO, DEBO_PERSONAL],
  replyTo: MATTHEW,
  subject: "Aman signing sprint: from Thursday it runs on the platform",
  text: NOTE,
};

const html = (text: string) =>
  text.split("\n\n").map((p) => `<p>${p.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/\n/g, "<br>")}</p>`).join("\n");

async function main() {
  const apply = process.argv.includes("--apply");
  const test = process.argv.includes("--test");
  const key = (process.env.ZEPTOMAIL_API_KEY || "").replace(/^Zoho-enczapikey\s*/i, "").trim();
  if ((apply || test) && !key) throw new Error("ZEPTOMAIL_API_KEY is not set. Run with --env-file=.env.local.");
  if (apply) {
    // The email points at the desk, so the desk must be there first.
    const r = await fetch(DESK, { redirect: "manual" });
    if (r.status === 404) throw new Error(`${DESK} returns 404. Deploy before sending.`);
  }
  // A test goes to Debo alone, identical apart from the subject, before the team sees it.
  const send = test ? { ...SEND, to: [DEBO], cc: [DEBO_PERSONAL], replyTo: DEBO, subject: `TEST: ${SEND.subject}` } : SEND;
  console.log(`to ${send.to.map((t) => t.name).join(", ")}\ncc ${send.cc.map((c) => c.address).join(", ")}\n${send.subject}`);
  if (!apply && !test) return console.log("\nDRY RUN. --test sends to Debo only; --apply sends to the team.");

  const res = await fetch(ZEPTO_ENDPOINT, {
    method: "POST",
    headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      from: FROM,
      to: send.to.map((t) => ({ email_address: t })),
      cc: send.cc.map((c) => ({ email_address: c })),
      reply_to: [send.replyTo],
      subject: send.subject,
      htmlbody: html(send.text),
      textbody: send.text,
    }),
  });
  const data = (await res.json().catch(() => null)) as { request_id?: string; message?: string; error?: { details?: { message?: string }[] } } | null;
  if (!res.ok) throw new Error(`ZeptoMail send failed: ${data?.error?.details?.[0]?.message ?? data?.message ?? `HTTP ${res.status}`}`);
  console.log(`sent, request_id=${data?.request_id ?? "?"}`);
}

main().catch((err) => {
  console.error(String(err instanceof Error ? err.message : err));
  process.exitCode = 1;
});
