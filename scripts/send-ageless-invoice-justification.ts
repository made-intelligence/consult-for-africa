/**
 * Why the AGELESS consultancy fee is NGN 1.4m and not the 1.0m in the 5 October budget.
 * To Dr Akinware, Dr Ajelabi in copy.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-invoice-justification.ts          # dry run
 *   npx tsx --env-file=.env.local scripts/send-ageless-invoice-justification.ts --send
 */
import { notifyInternal } from "@/lib/email";

const send = process.argv.includes("--send");
const TO = "itunu.akinware@medburyhealthcare.com";
const CC = ["adedotun.ajelabi@medlyfewellness.com", "dodulana@gmail.com"];
const SUBJECT = "Re: AGELESS: invoice CFA-2026-1015-AGL";

const html = `<div style="font-family:Arial,Helvetica,sans-serif;font-size:15px;line-height:1.6;color:#1d1a22;max-width:560px">
<p>Dear Dr Akinware,</p>
<p>The fee differs because the 5 October budget no longer described the engagement by the time of the evening.</p>
<ul>
<li><b>What the NGN 1.0m covered.</b> CFA's operational cost inside a NGN 13.26m programme that CFA would run end to end: venue, set, catering, an eight-week campaign, website and print.</li>
<li><b>What changed.</b> The event became AGELESS, moved to 21 October and was rebuilt around a new stage. Medbury contracted the films and coverage directly. CFA took on work the budget did not include: three film briefs, speaker packs and prep calls, the MC pack, guest RSVP and plus-ones, personal access passes, and design of the programme, flyers, backdrop and signage.</li>
<li><b>When it was priced.</b> The new scope was invoiced at NGN 1.4m on 15 October, six days before the evening. It was not raised afterwards.</li>
<li><b>The budget as a ceiling.</b> Other costs outside the 5 October budget were agreed in the same period, including the opening film, models and express fees. The budget was not treated as fixed for those, and it should not be for this line alone.</li>
</ul>
<p>The invoice stands at NGN 1.4m.</p>
<p>Kind regards,<br>Debo</p>
</div>`;

async function main() {
  if (!send) {
    console.log(`DRY RUN. To ${TO}, cc ${CC.join(", ")}. --send to go.`);
    return;
  }
  await notifyInternal(TO, SUBJECT, html);
  for (const cc of CC) await notifyInternal(cc, `${SUBJECT} (copy)`, html);
  console.log(`SENT to ${TO}, copies to ${CC.join(", ")}`);
}

main();
