/**
 * The invitation links, ready to paste into WhatsApp.
 *
 * Each inviter sends their own, so the queue can be read by who brought whom
 * without anybody keeping a parallel spreadsheet.
 *
 *   npx tsx scripts/print-ageless-invite-links.ts
 *   npx tsx scripts/print-ageless-invite-links.ts --md > docs/ageless/links.md
 */
import { LYFE_INVITERS, lyfeInviteLink, LYFE_EVENT } from "@/lib/lyfe";

const md = process.argv.includes("--md");

const BLURB =
  `You are invited to AGELESS, an evening hosted by Medlyfe on ${LYFE_EVENT.date} ` +
  `at ${LYFE_EVENT.venueName}. A panel on what changes in your body, brain and skin ` +
  `after 40, and what you can actually do about it. ${LYFE_EVENT.places} places. ` +
  `Apply here:`;

if (md) {
  console.log("## AGELESS invitation links\n");
  console.log(
    `${LYFE_EVENT.date}. ${LYFE_EVENT.venueName}. ${LYFE_EVENT.places} places.\n`,
  );
  console.log(
    "Each person sends their own link. Applying is not a place: the team still " +
      "chooses, and the invitation to confirm goes out afterwards.\n",
  );
  console.log("| Who | Drawing against | Places | Link |");
  console.log("| --- | --- | --- | --- |");
  for (const i of LYFE_INVITERS) {
    console.log(`| ${i.name} | ${i.bucket} | ${i.places} | ${lyfeInviteLink(i.key)} |`);
  }
  console.log("\n### The message to send\n");
  console.log(`${BLURB} <your link above>\n`);
} else {
  console.log(`\nAGELESS, ${LYFE_EVENT.date}, ${LYFE_EVENT.venueName}\n`);
  for (const i of LYFE_INVITERS) {
    console.log(`${i.name}`);
    console.log(`  ${lyfeInviteLink(i.key)}`);
    console.log(`  ${i.bucket}, ${i.places} places${i.note ? ` — ${i.note}` : ""}\n`);
  }
  console.log("Message to send:\n");
  console.log(`  ${BLURB} <link>\n`);
}
