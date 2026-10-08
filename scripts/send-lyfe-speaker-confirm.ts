/**
 * Each speaker's own pack, with one thing to do: confirm the bio and subject.
 *
 * One email per person, so nobody sees anyone else's address, and each one
 * carries only that speaker's slot, bio and questions.
 *
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-confirm.ts
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-confirm.ts --test
 *   npx tsx --env-file=.env.local scripts/send-lyfe-speaker-confirm.ts --send
 */
import { LYFE_SPEAKERS } from "@/lib/lyfeSpeakers";
import { emailLyfeSpeakerConfirm } from "@/lib/lyfeEmail";

const DEADLINE = "4pm tomorrow, Thursday 9 October";
const FROM_NAME = process.env.LYFE_SENDER_NAME || "Dr Debo Odulana";
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";

async function main() {
  const args = process.argv.slice(2);
  const test = args.includes("--test");
  const send = args.includes("--send");

  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  const targets = LYFE_SPEAKERS.filter((s) => s.email);
  const noEmail = LYFE_SPEAKERS.filter((s) => !s.email);

  if (noEmail.length) {
    console.log("No address, so not written to:");
    for (const s of noEmail) console.log(`  ${s.name}`);
    console.log();
  }

  if (test) {
    // Every speaker's version, all to Debo, so he reads what each will get.
    console.log(`TEST: sending all ${targets.length} versions to ${TEST_TO}\n`);
    for (const s of targets) {
      await emailLyfeSpeakerConfirm({
        to: TEST_TO,
        firstName: `${s.firstName}  [TEST, would go to ${s.email}]`,
        slot: s.slot,
        subject: s.subject,
        bio: s.bio,
        questions: s.questions,
        deadline: DEADLINE,
        fromName: FROM_NAME,
      });
      console.log(`  sent ${s.name}'s version`);
    }
    return;
  }

  console.log(send ? "SENDING to speakers\n" : "DRY RUN, --test to send them all to yourself, --send to go live\n");
  for (const s of targets) {
    const line = `  ${s.name.padEnd(30)} ${s.email}`;
    if (!send) {
      console.log(`${line}  ${s.bio ? "bio on file" : "NO BIO"}`);
      continue;
    }
    try {
      await emailLyfeSpeakerConfirm({
        to: s.email!,
        firstName: s.firstName,
        slot: s.slot,
        subject: s.subject,
        bio: s.bio,
        questions: s.questions,
        deadline: DEADLINE,
        fromName: FROM_NAME,
      });
      console.log(`${line}  SENT`);
    } catch (err) {
      console.error(`${line}  FAILED: ${err instanceof Error ? err.message : err}`);
    }
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
