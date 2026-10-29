/**
 * Seed the protocol inventory into the library, mapped to JCI chapters.
 *
 * Bodies are deliberately left NULL. The content is Haven's, written or
 * approved by Dr Odedina or Dr Shakirah. What this gives them is the shelf and
 * the labels, so every protocol that is not yet documented shows as a gap
 * rather than as an absence nobody notices. That is the audit finding made
 * operational: procedures exist, nobody was trained on them, nobody checks.
 *
 * Raw SQL because this checkout sits on another session's branch and its
 * generated client has no Protocol model. Parameterised throughout.
 *
 *   npx tsx --env-file=.env.local scripts/seed-haven-protocols.ts --apply
 */
import { randomBytes } from "crypto";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const APPLY = process.argv.includes("--apply");
const cuid = () => "c" + randomBytes(12).toString("hex");

type P = [code: string, chapter: string, title: string, method: string, freq: string, roles: string, summary: string];

// chapter is the PRIMARY JCI home. Several sit in more than one, and the
// cross-references live in lib/haven-jci.ts rather than being duplicated here.
const PROTOCOLS: P[] = [
  ["A1","COP","Crash trolley: contents, seal and the daily check","OBSERVED","QUARTERLY","Registered nurses, Medical officers","Finds every item without hesitation. Hesitation is a fail: in an arrest there is no time to look."],
  ["A2","COP","Paediatric resuscitation and escalation","SIMULATION","SIX_MONTHLY","Registered nurses, Medical officers","Run in the unit with the real equipment. Calling for help at the right moment is the step most often missed."],
  ["A3","COP","Neonatal resuscitation","SIMULATION","SIX_MONTHLY","NICU nurses, Medical officers, CMD","Not interchangeable with A2. A flat newborn is a different sequence and different equipment."],
  ["A4","COP","Anaphylaxis and severe allergic reaction","SIMULATION","ANNUAL","Registered nurses, Medical officers","Adrenaline drawn at the correct paediatric dose for a stated weight, inside the protocol's time."],
  ["A5","IPSG","Who to call, and when: the escalation ladder","QUESTIONS","ON_INDUCTION","All clinical staff, Front desk","Front desk included: they are often first to see a parent carrying a sick child in."],
  ["B1","MMU","Paediatric dose calculation by weight","QUESTIONS","SIX_MONTHLY","Registered nurses, Medical officers, Pharmacy","100 per cent, no partial credit. A decimal place in paediatrics is a tenfold error."],
  ["B2","MMU","Administration, and signing the chart at the bedside","OBSERVED","QUARTERLY","Registered nurses","If signing at the bedside is impractical that is an operations defect, not a nurse to fail."],
  ["B3","MMU","Controlled drugs: register, custody and count","RECORD_AUDIT","QUARTERLY","Pharmacy, Senior nurse, CMD","Never sampled. Counted in full, and it must reconcile exactly."],
  ["B4","MMU","Dispensing when the pharmacist is off site","QUESTIONS","QUARTERLY","Pharmacy technicians, Head of Admin","The live exposure: the pharmacist is part time and the cover arrangement is undocumented."],
  ["B5","MMU","Cold chain: the fridge log, and a breach","RECORD_AUDIT","QUARTERLY","Pharmacy, Registered nurses","The audit found no cold chain record at all."],
  ["C1","IPSG","Hand hygiene, at the right moments","OBSERVED","QUARTERLY","Everyone who touches a patient","Observed unannounced. Announced observation measures compliance with being watched."],
  ["C2","PCI","Isolating a suspected infectious child","QUESTIONS","ANNUAL","Clinical staff, Front desk, Attendants","The decision that matters most is made at the door, before anybody clinical has seen the child."],
  ["C3","FMS","Sharps, spillage and biohazard waste","OBSERVED","ANNUAL","All clinical staff, Attendants","The audit found these procedures referenced and never supplied."],
  ["C4","PCI","Cleaning and decontamination between patients","OBSERVED","QUARTERLY","Attendants, Registered nurses","Contact time is the step always shortened when the unit is busy."],
  ["D1","AOP","Admission, assessment and the observation schedule","RECORD_AUDIT","QUARTERLY","Registered nurses, Medical officers","A documented response to an abnormal observation is the half that fails."],
  ["D2","COP","NICU routines: thermoregulation, feeding, monitoring","OBSERVED","QUARTERLY","NICU nurses, Medical officers","Nobody works a NICU shift unsupervised before passing this."],
  ["D3","COP","Jaundice assessment and phototherapy","QUESTIONS","SIX_MONTHLY","NICU nurses, Medical officers","Reads the threshold against age in hours, and states when to escalate."],
  ["D4","COP","Oxygen: prescribing, delivery and weaning","OBSERVED","SIX_MONTHLY","Registered nurses, Medical officers","Equipment availability is part of this check; the concentrator record could not be confirmed."],
  ["D5","ACC","Discharge: criteria, summary, medicines, follow up","RECORD_AUDIT","QUARTERLY","Medical officers, Senior nurse","Also a scoreboard measure, so checked twice for two different reasons."],
  ["E1","IPSG","Handover, in the agreed structure","OBSERVED","QUARTERLY","Registered nurses, Medical officers","Observed unannounced twice a week. Where most harm is prevented or created."],
  ["E2","IPSG","Patient identification before any intervention","OBSERVED","QUARTERLY","All clinical staff","Two identifiers every time, especially when the parent is known to the nurse."],
  ["E3","MOI","Documentation: at the time, complete, attributable","RECORD_AUDIT","QUARTERLY","All clinical staff","The same three defects recur. Fixing those three beats a perfect policy."],
  ["E4","PCC","Consent for procedures","RECORD_AUDIT","SIX_MONTHLY","Medical officers","Who consented, and their relationship to the child."],
  ["E5","QPS","Reporting an incident or a near miss","QUESTIONS","ON_INDUCTION","Everybody, without exception","Knows it can be anonymous and that nothing happens to them. Any other answer is a finding about us."],
  ["F1","FMS","NICU equipment: incubator, warmer, phototherapy, monitors","OBSERVED","SIX_MONTHLY","NICU nurses, Medical officers","Sets up, alarms and troubleshoots each device unaided."],
  ["F2","FMS","The daily equipment and environment check","RECORD_AUDIT","QUARTERLY","Registered nurses","A dated, named check for every calendar day. Gaps are the finding."],
  ["F3","AOP","Laboratory calibration and quality control","RECORD_AUDIT","QUARTERLY","Medical Lab Scientist","The audit found these records outstanding."],
  ["F4","FMS","Power failure and oxygen supply failure","SIMULATION","ANNUAL","All clinical staff, Attendants","Run as a drill. Everyone knows their own action, including who moves which baby first."],
  ["G1","ACC","Registration and payer details before the encounter","RECORD_AUDIT","QUARTERLY","Front desk, Billing","Incomplete details at the desk become a refused claim six weeks later."],
  ["G2","GLD","Capture and billing of everything delivered","RECORD_AUDIT","QUARTERLY","Billing, Registered nurses","Nurses are on this list on purpose: most leakage is an item used at the bedside and never recorded."],
  ["G3","ACC","Deposits, refunds, and admitting below the floor","RECORD_AUDIT","SIX_MONTHLY","Front desk, Head of Finance","Every admission below the deposit floor carries a named authorisation. This ledger was never supplied."],
  ["G4","GLD","Stock: reorder points, counting, near expiry","RECORD_AUDIT","QUARTERLY","Pharmacy, Head of Admin","Fast movers weekly against the reorder point, near expiry monthly."],
  ["G5","PCC","Telling a waiting family what is happening","OBSERVED","QUARTERLY","Front desk, All clinical staff","A time given and then honoured. The promise to come back only works if it happens."],
];

async function main() {
  const c = await prisma.$queryRaw<{ id: string }[]>`
    SELECT "id" FROM "Client" WHERE "name" = 'Haven Paediatric Centre' LIMIT 1`;
  if (!c.length) throw new Error("No Haven client.");
  const clientId = c[0].id;

  for (const [code, chapter, title, method, freq, roles, summary] of PROTOCOLS) {
    if (APPLY) {
      await prisma.$executeRaw`
        INSERT INTO "Protocol" ("id","clientId","code","domain","title","summary","body","version","roles","departments","method","frequency","isActive","createdAt","updatedAt")
        VALUES (${cuid()}, ${clientId}, ${code}, ${chapter}, ${title}, ${summary}, NULL, 1,
                ${roles.split(", ")}, ARRAY[]::text[], ${method}, ${freq}, true, NOW(), NOW())
        ON CONFLICT ("clientId","code") DO UPDATE SET
          "domain" = EXCLUDED."domain", "title" = EXCLUDED."title", "summary" = EXCLUDED."summary",
          "roles" = EXCLUDED."roles", "method" = EXCLUDED."method", "frequency" = EXCLUDED."frequency",
          "updatedAt" = NOW()`;
    }
  }

  if (!APPLY) { console.log(`  DRY RUN. ${PROTOCOLS.length} protocols ready. Re-run with --apply.`); return; }

  const byChapter = await prisma.$queryRaw<{ domain: string; n: bigint; documented: bigint }[]>`
    SELECT "domain", COUNT(*)::bigint AS n, COUNT("body")::bigint AS documented
    FROM "Protocol" WHERE "clientId" = ${clientId} GROUP BY "domain" ORDER BY 2 DESC`;
  console.log(`  ${PROTOCOLS.length} protocols seeded.\n`);
  for (const r of byChapter) {
    console.log(`   ${r.domain.padEnd(6)} ${String(r.n).padStart(2)} protocols, ${r.documented} documented`);
  }
}

main().catch((e) => { console.error(String(e)); process.exitCode = 1; }).finally(() => prisma.$disconnect());
