/**
 * Asks confirmed speakers for a bio and a photograph.
 *
 * Dry by default. Nothing leaves the building without --send, because these
 * go to people outside the firm and a misfire cannot be recalled.
 *
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-asks.ts
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-asks.ts --send
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-asks.ts --send --only=hello@gbemigiwa.com
 *
 * The --env-file matters. Without it the sender falls through to Zoho SMTP,
 * which throttles and is not the path outreach is allowed to take.
 */
import { LYFE_SPEAKERS, speakersWeCanEmail } from "@/lib/lyfeSpeakers";
import { emailLyfeSpeakerAsk } from "@/lib/lyfeEmail";

const DEADLINE = "Friday 10 October";
const FROM_NAME = process.env.LYFE_SENDER_NAME || "Debo Odulana";

async function main() {
  const args = process.argv.slice(2);
  const send = args.includes("--send");
  const only = args.find((a) => a.startsWith("--only="))?.split("=")[1];

  if (send && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("ZEPTOMAIL_API_KEY is not set. Refusing to send, because the");
    console.error("fallback is Zoho SMTP and bulk outreach must not go that way.");
    process.exit(1);
  }

  let targets = speakersWeCanEmail();
  if (only) targets = targets.filter((s) => s.email === only);

  const noEmail = LYFE_SPEAKERS.filter((s) => !s.email && s.need.length > 0);

  console.log(`${LYFE_SPEAKERS.length} on the roster.`);
  console.log(`${targets.length} can be written to now.`);
  if (noEmail.length) {
    console.log(`\nStill need an address for:`);
    for (const s of noEmail) console.log(`  ${s.name.padEnd(30)} ${s.need.join(", ")}`);
  }

  console.log(`\n${send ? "SENDING" : "DRY RUN, pass --send to actually send"}\n`);

  for (const s of targets) {
    const line = `  ${s.name.padEnd(30)} ${s.email!.padEnd(28)} needs ${s.need.join(", ")}`;
    if (!send) {
      console.log(line);
      continue;
    }
    try {
      await emailLyfeSpeakerAsk({
        to: s.email!,
        firstName: s.firstName,
        slot: s.slot,
        needSubject: s.need.includes("subject"),
        deadline: DEADLINE,
        fromName: FROM_NAME,
      });
      console.log(`${line}  SENT`);
    } catch (err) {
      console.error(`${line}  FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
