/**
 * The relaunch email. Goes to all nineteen at Haven once everything is in
 * place: their access to the staff page, the onboarding and reorientation pack,
 * and the deck from the town hall.
 *
 * One email per person, never a group To or Cc, because nineteen people seeing
 * each other's addresses in a header is both a data problem and the wrong tone
 * for something that is meant to read as addressed to them.
 *
 * ZeptoMail HTTP API only, no SMTP fallback.
 *
 * TWO GUARDS BEFORE ANYTHING LEAVES, both learned the hard way:
 *   - every roster address is checked for a bounce flag and for shape
 *   - the staff page is fetched and has to return 200. Nineteen emails
 *     pointing at a dead link is nineteen people deciding this is not serious,
 *     and you only get to introduce something once.
 *
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-relaunch.ts
 *   npx tsx --env-file=.env.local scripts/send-haven-staff-relaunch.ts --send
 */
import fs from "fs";
import path from "path";

const SEND = process.argv.includes("--send");
// --test sends one real copy to Debo instead of the nineteen, so he can see
// exactly what lands. It skips the live-page guard on purpose: the point is to
// review the message, and he already knows the page is not up yet.
const TEST = process.argv.includes("--test");
const TEST_TO = ["debo.odulana@consultforafrica.com", "dodulana@gmail.com"];
// Reviewed by the office before it goes anywhere near the hospital.
const TEST_CC = [
  "abigail.ayomide04@gmail.com",   // Abigail Oladejo
  "ogeriorji845@gmail.com",        // Ezinne Orji
];
const STAFF_PAGE = "https://www.consultforafrica.com/HavenStaff";
const CC = ["debo.odulana@consultforafrica.com"];
const SUBJECT = "Haven: your staff page, and today's town hall";

const ATTACHMENTS = [
  { file: "docs/haven-staff-onboarding-pack-cfa.pdf", name: "Welcome-to-Haven-Again.pdf" },
  { file: "docs/haven-town-hall-deck-cfa.pdf", name: "Haven-Town-Hall.pdf" },
];

interface Staff {
  firstName: string; lastName: string; email: string;
  department: string; position: string; dataIssue?: string;
}

function greeting(s: Staff) {
  return s.department === "MEDICAL" ? `Dr ${s.firstName}` : s.firstName;
}

function body(s: Staff) {
  return `Dear ${greeting(s)},

Thank you for this morning. Everything we talked about at the town hall is attached, and there is now a staff page where the rest of it lives.

  ${STAFF_PAGE}

Sign in the first time with your email address and we will send you a six-digit code. There is no password to remember. It is worth doing, because most of what is useful sits behind it.

Once you are in you will find everyone's name, role and number in one place, so you are not scrolling through WhatsApp at three in the morning trying to work out who is on. You can ask for leave from your phone and see who else in your area is already off before you pick your dates. There is a notes board for telling your team or the whole hospital something. And there is one short question each week that takes a single tap.

Two forms are there for anybody, signed in or not, and both can be sent without your name on them. One is for reporting something that nearly went wrong. The other is for anything that is simply broken or wastes your time. Nothing happens to anybody for using either.

Two documents are attached. The pack is the one worth twenty minutes: why everybody at Haven is being started again at the same time, what we are trying to achieve, how we will all see how we are doing, and how speaking up is going to work. The deck is what you saw today.

If anything in the pack is wrong, or does not match how things actually work on your shift, tell us. You know where this hospital leaks time and effort better than anybody who arrives with a clipboard.

Warm regards,

Dr Debo Odulana
Founding Partner, Consult for Africa
hello@consultforafrica.com  ·  +234 913 813 8553  ·  consultforafrica.com`;
}

async function main() {
  const roster: Staff[] = JSON.parse(
    fs.readFileSync(path.resolve(process.cwd(), "docs/data/haven-staff-roster.json"), "utf8")
  ).staff;

  // Guard one: the addresses.
  const bouncing = roster.filter((s) => s.dataIssue?.toLowerCase().includes("bounce"));
  const malformed = roster.filter((s) => !/^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(s.email));
  const seen = new Set<string>();
  const dupes = roster.filter((s) => !seen.add(s.email.toLowerCase()));
  if (bouncing.length || malformed.length || dupes.length) {
    throw new Error(
      `Refusing to send. bouncing=${bouncing.map((s) => s.email)} ` +
      `malformed=${malformed.map((s) => s.email)} duplicates=${dupes.map((s) => s.email)}`
    );
  }

  const files = ATTACHMENTS.map((a) => {
    const p = path.resolve(process.cwd(), a.file);
    if (!fs.existsSync(p)) throw new Error(`Attachment missing: ${a.file}. Build it first.`);
    return { ...a, buf: fs.readFileSync(p) };
  });

  // Guard two: the destination has to actually be there.
  let pageOk = false;
  try {
    const probe = await fetch(STAFF_PAGE, { method: "GET", redirect: "follow" });
    pageOk = probe.ok;
    console.log(`staff page ${STAFF_PAGE} -> ${probe.status}${probe.ok ? "" : "  NOT LIVE"}`);
  } catch (e) {
    console.log(`staff page ${STAFF_PAGE} -> unreachable (${String(e).slice(0, 80)})`);
  }

  console.log(`
  Recipients: ${roster.length}, one email each
  Cc:         ${CC.join(", ")}
  Subject:    ${SUBJECT}
  Attached:   ${files.map((f) => `${f.name} (${Math.round(f.buf.length / 1024)}kb)`).join(", ")}
`);
  console.log(`  Sample (${roster[0].firstName}):\n`);
  console.log(body(roster[0]).split("\n").map((l) => `  | ${l}`).join("\n"));

  if (!SEND && !TEST) {
    console.log("\n  DRY RUN. Nothing sent. Re-run with --send, or --test to send yourself a copy.\n");
    return;
  }
  if (!TEST && !pageOk) {
    throw new Error(
      `Refusing to send: ${STAFF_PAGE} is not live. Nineteen emails pointing at a dead link ` +
      `is nineteen people deciding this is not serious, and you only introduce it once.`
    );
  }

  const rawKey = process.env.ZEPTOMAIL_API_KEY;
  if (!rawKey) throw new Error("ZEPTOMAIL_API_KEY not set. This goes via ZeptoMail only, never Zoho SMTP.");
  const apiKey = rawKey.replace(/^Zoho-enczapikey\s*/i, "").trim();
  const fromRaw = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
  const m = fromRaw.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  const from = m ? { address: m[2].trim(), name: m[1].trim() } : { address: fromRaw.trim() };
  const attachments = files.map((f) => ({
    content: f.buf.toString("base64"),
    mime_type: "application/pdf",
    name: f.name,
  }));

  // In test mode the message is rendered for a real staff member, so the
  // greeting and tone are exactly what they would see, but it is delivered to
  // Debo. Chioma is used because nursing is the largest group.
  const sample = roster.find((s) => s.department === "NURSING") ?? roster[0];
  const targets = TEST
    ? [{ to: { address: TEST_TO[0], name: "Debo Odulana" }, render: sample }]
    : roster.map((s) => ({ to: { address: s.email, name: `${s.firstName} ${s.lastName}` }, render: s }));

  let sent = 0, failed = 0;
  for (const { to, render: s } of targets) {
    const text = body(s);
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${apiKey}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: to }],
        cc: (TEST ? TEST_CC : CC).map((address) => ({ email_address: { address } })),
        reply_to: [{ address: process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com" }],
        subject: TEST ? `[FOR REVIEW, not sent to staff] ${SUBJECT}` : SUBJECT,
        htmlbody: text.replace(/\n/g, "<br>"),
        textbody: text,
        attachments,
      }),
    });
    const data: any = await res.json().catch(() => null);
    if (TEST) console.log("  ZeptoMail said:\n" + JSON.stringify(data, null, 2));
    if (!res.ok) {
      failed++;
      console.error(`  FAILED ${to.address}: ${res.status} ${JSON.stringify(data)}`);
    } else {
      sent++;
      console.log(`  sent ${to.address} request=${data?.request_id ?? "?"}`);
    }
    await new Promise((r) => setTimeout(r, 400));
  }
  console.log(`\n  ${sent} sent, ${failed} failed${TEST ? ' (TEST, staff untouched)' : `, of ${roster.length}`}.`);
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => undefined);
