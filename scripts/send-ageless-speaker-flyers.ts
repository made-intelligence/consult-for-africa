/**
 * Each speaker's own AGELESS flyer, attached, with a caption to post it with.
 *
 * The caption carries the speaker's own link (?i=<key>), so whoever registers
 * from their post is credited to them even though the flyer itself prints the
 * general address.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-flyers.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-flyers.ts --only=odulana --send
 *   npx tsx --env-file=.env.local scripts/send-ageless-speaker-flyers.ts --send
 *
 * The platform's mail path has no attachments, so this calls ZeptoMail
 * directly, from SMTP_FROM, and refuses to run without ZEPTOMAIL_API_KEY.
 */
import { readFileSync } from "fs";
import { lyfeInviteLink } from "@/lib/lyfe";

const args = process.argv.slice(2);
const send = args.includes("--send");
const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];
/** The follow-up: the version with the caption and their link printed on it. */
const captioned = args.includes("--captioned");

const SPEAKERS = [
  { slug: "odulana", key: "cfa", to: "dodulana@gmail.com", first: "Debo", role: "chairing the panel" },
  { slug: "ajelabi", key: "ajelabi", to: "adedotun.ajelabi@medlyfewellness.com", first: "Dr Ajelabi", role: "opening the evening: can we live to 100 and still live well?" },
  { slug: "adenuga", key: "adenuga", to: "timiadenuga@getslim.ng", first: "Dr Adenuga", role: "speaking on weight, metabolism and longevity" },
  { slug: "giwa", key: "gbemi", to: "hello@gbemigiwa.com", first: "Gbemi", role: "speaking on lifestyle and behaviour change for longevity" },
  { slug: "awosika", key: "joycee", to: "Soar@joyceeawosika.com", first: "Joycee", role: "speaking on stress management, self care and longevity" },
];

function parseFrom(raw: string) {
  const m = raw.match(/^\s*"?([^"<]*)"?\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), address: m[2].trim() } : { name: "Consult for Africa", address: raw.trim() };
}

function captionedBody(first: string, link: string) {
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear ${first},</p>
<p>A second version of your AGELESS flyer is attached, with the caption on the flyer itself and your own link printed in the footer, so it works as a post on its own.</p>
<p>Your link, for anywhere you can paste one: <a href="${link}">${link}</a></p>
<p>Use whichever version suits.</p>
<p>Warm regards,<br>Debo</p>
</div>`;
  const text = `Dear ${first},\n\nA second version of your AGELESS flyer is attached, with the caption on the flyer itself and your own link printed in the footer, so it works as a post on its own.\n\nYour link, for anywhere you can paste one: ${link}\n\nUse whichever version suits.\n\nWarm regards,\nDebo`;
  return { html, text };
}

function body(first: string, role: string, link: string) {
  const caption =
    `I'll be ${role} at AGELESS, an intimate evening hosted by MedLYFE and The Lyfe Place on how modern science is changing the way we look, feel, perform and live as we age. ` +
    `Wednesday 21 October, Capital Club Lagos. Places are limited. Register here: ${link}`;
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear ${first},</p>
<p>Attached is your speaker flyer for AGELESS on Wednesday 21 October, made to be shared on Instagram, WhatsApp status and LinkedIn.</p>
<p>If you post it, please use the link below. It is yours, so we can see who joins us through you:</p>
<p><a href="${link}">${link}</a></p>
<p>A caption, if useful:</p>
<p style="background:#f4f6ef;border-left:3px solid #94b25c;padding:10px 14px">${caption}</p>
<p>Thank you for being part of the evening.</p>
<p>Warm regards,<br>Debo</p>
</div>`;
  const text = `Dear ${first},\n\nAttached is your speaker flyer for AGELESS on Wednesday 21 October, made to be shared on Instagram, WhatsApp status and LinkedIn.\n\nIf you post it, please use this link. It is yours, so we can see who joins us through you:\n${link}\n\nA caption, if useful:\n${caption}\n\nThank you for being part of the evening.\n\nWarm regards,\nDebo`;
  return { html, text };
}

async function main() {
  const key = process.env.ZEPTOMAIL_API_KEY?.replace(/^Zoho-enczapikey\s*/i, "").trim();
  if (send && !key) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  const from = parseFrom(process.env.SMTP_FROM || "hello@consultforafrica.com");
  const list = SPEAKERS.filter((s) => !only || s.slug === only);

  for (const s of list) {
    const link = lyfeInviteLink(s.key);
    const file = `docs/ageless/speakers/flyer-${s.slug}${captioned ? "-captioned" : ""}.png`;
    const png = readFileSync(file).toString("base64");
    const { html, text } = captioned ? captionedBody(s.first, link) : body(s.first, s.role, link);
    const line = `  ${s.first.padEnd(12)} ${s.to.padEnd(40)} ${link}`;
    if (!send) {
      console.log(`${line}  (${file})`);
      continue;
    }
    const res = await fetch("https://api.zeptomail.com/v1.1/email", {
      method: "POST",
      headers: {
        Authorization: `Zoho-enczapikey ${key}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        from,
        to: [{ email_address: { address: s.to } }],
        subject: captioned ? "Your AGELESS flyer, with the caption on it" : "Your AGELESS speaker flyer",
        htmlbody: html,
        textbody: text,
        attachments: [{ content: png, mime_type: "image/png", name: `AGELESS-${s.slug}${captioned ? "-captioned" : ""}.png` }],
      }),
    });
    const data = (await res.json().catch(() => null)) as { message?: string; error?: { message?: string } } | null;
    console.log(`${line}  ${res.ok ? "SENT" : `FAILED ${res.status} ${data?.error?.message ?? data?.message ?? ""}`}`);
  }
  if (!send) console.log("\nDRY RUN. --send to go live, --only=<slug> for one.");
}

main();
