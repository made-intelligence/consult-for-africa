/**
 * The speakers' reminder for AGELESS, with a poll for a prep call.
 *
 * Each speaker gets the evening's facts, their own subject and questions, and
 * four one-click options for the prep call. Each option is a mailto to Debo
 * with the slot in the subject, so the votes land in one inbox and need no
 * page, route or deploy.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-reminder.ts             # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-reminder.ts --preview    # writes the HTML to scratch
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-reminder.ts --only=odulana --send
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-reminder.ts --send
 *
 * Joycee has already said 2pm, so hers confirms it rather than asking.
 *
 * Dr Kpaduwa has no address on the roster, so she is reached on WhatsApp.
 */
import { writeFileSync } from "fs";
import { LYFE_SPEAKERS } from "@/lib/lyfeSpeakers";
import { LYFE_EVENT, lyfeInviteLink } from "@/lib/lyfe";

const args = process.argv.slice(2);
const send = args.includes("--send");
const preview = args.find((a) => a.startsWith("--preview="))?.split("=")[1];
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];

const REPLY_TO = "dodulana@gmail.com";

/** Two prep sessions tomorrow; each speaker joins one. Rooms on Mezo's Daily, expiring midnight Monday. */
const SESSIONS = [
  { when: "Monday 19 October, 2:00pm", url: "https://tinyurl.com/ageless-speakers-2pm" },
  { when: "Monday 19 October, 6:00pm", url: "https://tinyurl.com/ageless-speakers-6pm" },
];

/** Roster slug to invite key, as the flyers used them. */
const LIST = [
  { match: "Ajelabi", key: "ajelabi", slug: "ajelabi", seat: "You open the evening at 6:40pm with a 20 minute address, before the panel." },
  { match: "Odulana", key: "cfa", slug: "odulana", seat: "You chair the panel, 7:00pm to 7:45pm, and the questions from the room after it." },
  { match: "Adenuga", key: "adenuga", slug: "adenuga", seat: "You are on the panel, 7:00pm to 7:45pm, with about 11 minutes of it." },
  { match: "Giwa", key: "gbemi", slug: "giwa", seat: "You are on the panel, 7:00pm to 7:45pm, with about 11 minutes of it." },
  { match: "Awosika", key: "joycee", slug: "awosika", booked: 0, seat: "You are on the panel, 7:00pm to 7:45pm, with about 11 minutes of it." },
];

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

function pollHref(name: string, slot: string) {
  const subject = `AGELESS prep call: ${slot}`;
  const body = `${name} can do ${slot}.`;
  return `mailto:${REPLY_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

function build(sp: (typeof LYFE_SPEAKERS)[number], seat: string, link: string, booked?: number) {
  const first = sp.firstName;
  const ev = LYFE_EVENT;
  const questions = sp.questions ?? [];
  const focus = sp.focus ?? "";

  const facts: [string, string][] = [
    ["When", `${ev.date}, 6:00pm to 9:30pm`],
    ["Where", `${ev.venueName}, ${ev.venueAddress}`],
    ["Speakers", "Please be in the room by 6:15pm"],
    ["Dress", "Smart casual"],
    ["Format", "No slides, no lectern. 70 invited guests"],
  ];
  const running = [
    ["6:00", "Arrival"],
    ["6:30", "The opening film"],
    ["6:40", "Dr Adedotun Ajelabi: Can We Live to 100 and Still Live Well?"],
    ["7:00", "The panel: The Ageless Blueprint, chaired by Dr Debo Odulana"],
    ["7:45", "Questions from the room"],
    ["8:15", "Ageless After Hours"],
    ["9:30", "Close"],
  ];

  const td = "padding:4px 12px 4px 0;vertical-align:top";
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:600px">
<p>Dear ${esc(first)},</p>
<p>AGELESS is this Wednesday. Here is everything in one place, and a request for a short prep call before then.</p>

<p style="margin:22px 0 6px;font-weight:bold">A 30 minute prep call tomorrow</p>
<p style="margin:0 0 10px">To agree the running order, the hand-offs and what each of us covers so we do not overlap. There are two sessions tomorrow, so everyone can make one.</p>
${booked !== undefined
  ? `<p style="margin:0 0 6px">You are down for <b>${SESSIONS[booked].when}</b>. Thank you. Join here: <a href="${SESSIONS[booked].url}">${SESSIONS[booked].url}</a></p>`
  : `<p style="margin:0 0 6px">Please click the one you will join, so I know who to expect:</p>
${SESSIONS.map((x) => `<p style="margin:6px 0"><a href="${pollHref(sp.name, x.when)}" style="display:inline-block;padding:8px 14px;border:1px solid #94b25c;border-radius:4px;color:#1d1a22;text-decoration:none">${esc(x.when)}</a> &nbsp;join: <a href="${x.url}">${x.url}</a></p>`).join("\n")}`}
<p style="margin:10px 0 0">The link opens in the browser, nothing to install.</p>

<p style="margin:22px 0 6px;font-weight:bold">The evening</p>
<table style="border-collapse:collapse;font-size:15px">${facts.map(([k, v]) => `<tr><td style="${td};color:#6b6570">${k}</td><td style="${td}">${esc(v)}</td></tr>`).join("")}</table>

<p style="margin:22px 0 6px;font-weight:bold">Running order</p>
<table style="border-collapse:collapse;font-size:15px">${running.map(([t, w]) => `<tr><td style="${td};color:#6b6570">${t}</td><td style="${td}">${esc(w)}</td></tr>`).join("")}</table>

<p style="margin:22px 0 6px;font-weight:bold">Your part: ${esc(sp.subject)}</p>
<p style="margin:0 0 8px">${esc(seat)}</p>
${focus ? `<p style="margin:0 0 8px">${esc(focus)}</p>` : ""}
${questions.length ? `<p style="margin:0 0 4px">Questions you may be asked. A brief, not a script; tell me on the call what you would rather be asked.</p><ol style="margin:0;padding-left:20px">${questions.map((q) => `<li>${esc(q)}</li>`).join("")}</ol>` : ""}
<p style="margin:10px 0 0">One rule for the panel: every answer ends in something a guest can do this week.</p>

<p style="margin:22px 0 6px;font-weight:bold">Your invitation link</p>
<p style="margin:0">If you share the flyer or invite anyone, please use <a href="${link}">${link}</a>. It is yours, so we can see who joins through you.</p>

<p style="margin:22px 0 0">Thank you. Looking forward to Wednesday.</p>
<p>Warm regards,<br>Debo</p>
</div>`;

  const text = [
    `Dear ${first},`,
    "",
    "AGELESS is this Wednesday. Here is everything in one place, and a request for a short prep call before then.",
    "",
    "A 30 MINUTE PREP CALL TOMORROW",
    "To agree the running order, the hand-offs and what each of us covers. Two sessions tomorrow, so everyone can make one.",
    ...(booked !== undefined
      ? [`You are down for ${SESSIONS[booked].when}. Join here: ${SESSIONS[booked].url}`]
      : ["Reply with the one you will join:", ...SESSIONS.map((x) => `- ${x.when}: ${x.url}`)]),
    "",
    "THE EVENING",
    ...facts.map(([k, v]) => `${k}: ${v}`),
    "",
    "RUNNING ORDER",
    ...running.map(([t, w]) => `${t}  ${w}`),
    "",
    `YOUR PART: ${sp.subject}`,
    seat,
    ...(focus ? ["", focus] : []),
    ...(questions.length ? ["", "Questions you may be asked (a brief, not a script):", ...questions.map((q, i) => `${i + 1}. ${q}`)] : []),
    "",
    "One rule for the panel: every answer ends in something a guest can do this week.",
    "",
    `Your invitation link: ${link}`,
    "",
    "Thank you. Looking forward to Wednesday.",
    "",
    "Warm regards,",
    "Debo",
  ].join("\n");

  return { html, text };
}

function parseFrom(raw: string) {
  const m = raw.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), address: m[2].trim() } : { name: "Consult for Africa", address: raw.trim() };
}

async function main() {
  const key = process.env.ZEPTOMAIL_API_KEY?.replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (send && !key) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  const from = parseFrom(process.env.SMTP_FROM || "hello@consultforafrica.com");

  for (const row of LIST.filter((r) => !only || r.slug === only)) {
    const sp = LYFE_SPEAKERS.find((s) => s.name.includes(row.match));
    if (!sp?.email) {
      console.log(`  ${row.match.padEnd(12)} NO ADDRESS, skipped`);
      continue;
    }
    const link = lyfeInviteLink(row.key);
    const { html, text } = build(sp, row.seat, link, "booked" in row ? row.booked : undefined);
    const line = `  ${sp.firstName.padEnd(12)} ${sp.email.padEnd(40)}`;
    if (preview && row.slug === preview) {
      const out = `${process.env.TMPDIR ?? "/tmp"}/ageless-reminder-${row.slug}.html`;
      writeFileSync(out, html);
      console.log(`  preview: ${out}`);
    }
    if (!send) {
      console.log(line);
      continue;
    }
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: { Authorization: `Zoho-enczapikey ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: sp.email } }],
        reply_to: [{ address: REPLY_TO, name: "Debo Odulana" }],
        subject: "AGELESS on Wednesday: your reminder, and the prep call tomorrow",
        htmlbody: html,
        textbody: text,
      }),
    });
    const data = (await res.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    console.log(`${line}  ${res.ok ? "SENT" : `FAILED ${res.status} ${data?.error?.message ?? data?.message ?? ""}`}`);
  }
  if (!send) console.log("\nDRY RUN. --send to go live, --only=<slug> for one.");
}

main();
