/**
 * The two orthopaedic anchors, invited to Mezo by name.
 *
 * Not the CadreHealth claim template. That one tells a member the place they
 * earned is ready, and neither of these two has ever been on CadreHealth.
 * These are colleagues Debo asked personally, so the note is from him and
 * reads like it.
 *
 *   npx tsx --env-file=.env.local scripts/send-mezo-ortho-invites.ts
 *   npx tsx --env-file=.env.local scripts/send-mezo-ortho-invites.ts --send
 */
import { notifyInternal } from "@/lib/email";

const FROM_NAME = "Dr Debo Odulana";

const INVITES = [
  {
    email: "bolarinwa.akinola@osteonclinics.com",
    greeting: "Bola",
    claimUrl: "https://mezohealth.com/claim/beab6c5008296d6b997f630894ca737b17730a58281052ba",
  },
  {
    email: "info@parasorthocare.com",
    greeting: "Dr Kumar",
    claimUrl: "https://mezohealth.com/claim/664710f8b274f04096d647cd0c2032462d6bce70817a2527",
  },
];

function esc(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function html(greeting: string, claimUrl: string) {
  return `<div style="font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif;font-size:15px;line-height:1.65;color:#1F2937;max-width:560px;">
    <p style="margin:0 0 14px;">Dear ${esc(greeting)},</p>
    <p style="margin:0 0 14px;">I am building out orthopaedics on Mezo, and I would like you to be one of the two surgeons it is built around.</p>
    <p style="margin:0 0 14px;">Mezo is our private practice network. Patients find a named consultant, see their availability and book, and the surgical side runs through Mezo Surgery at one fixed all-in price per procedure. Orthopaedics and spine is the centre I most want right, which is why I am asking you rather than advertising for anyone.</p>
    <p style="margin:0 0 14px;">I have opened a place in your name. Nothing is public until you claim it, and claiming it lets you set your own profile, your fees and the days you will actually see people.</p>
    <table cellpadding="0" cellspacing="0" style="margin:22px 0;">
      <tr><td style="background:#0A7B6E;">
        <a href="${claimUrl}" style="display:inline-block;padding:14px 30px;color:#ffffff;font-size:15px;font-weight:600;text-decoration:none;">Claim your place</a>
      </td></tr>
    </table>
    <p style="margin:0 0 14px;font-size:13px;color:#6B7280;">If the button does not work: <a href="${claimUrl}" style="color:#0A7B6E;">${esc(claimUrl)}</a>. The link is yours and it lapses in thirty days.</p>
    <p style="margin:0 0 14px;">If you would rather talk it through before clicking anything, say so and I will call you.</p>
    <p style="margin:0 0 6px;">Warm regards,</p>
    <p style="margin:0;font-weight:600;">${esc(FROM_NAME)}</p>
    <p style="margin:2px 0 0;font-size:13px;color:#6B7280;">Consult for Africa</p>
  </div>`;
}

async function main() {
  const send = process.argv.includes("--send");
  if (send && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }
  console.log(send ? "SENDING\n" : "DRY RUN, pass --send\n");
  for (const i of INVITES) {
    if (!send) {
      console.log(`  ${i.email.padEnd(40)} as "${i.greeting}"`);
      continue;
    }
    try {
      await notifyInternal(i.email, "A place for you on Mezo", html(i.greeting, i.claimUrl));
      console.log(`  ${i.email} SENT`);
    } catch (e) {
      console.error(`  ${i.email} FAILED: ${e instanceof Error ? e.message : e}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
