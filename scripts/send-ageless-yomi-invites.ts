/**
 * The AGELESS invitation to Yomi's Medbury corporate list.
 *
 * The list came on 15 October as "Batch 1 - Medbury Medicals Service List"
 * and is kept at docs/ageless/lists/yomi-medbury.csv (not in git). It carries
 * Yomi's link, so anyone who registers from it is credited to Yomi, and says
 * Medbury introduced us.
 *
 * Dropped before sending: anyone already registered, by address or by
 * surname (Dr Opawoye registered from a personal address), suppressed
 * addresses, and anyone already in the platform's invitation record.
 *
 *   npx tsx --env-file=.env.local scripts/send-ageless-yomi-invites.ts
 *   npx tsx --env-file=.env.local scripts/send-ageless-yomi-invites.ts --test
 *   npx tsx --env-file=.env.local scripts/send-ageless-yomi-invites.ts --send
 */
import { readFileSync } from "fs";
import { PrismaClient } from "@prisma/client";
import { emailLyfeListInvite } from "@/lib/lyfeEmail";

const prisma = new PrismaClient();
const args = process.argv.slice(2);
const send = args.includes("--send");
const test = args.includes("--test");
const TEST_TO = process.env.LYFE_TEST_TO || "dodulana@gmail.com";
const CSV = "docs/ageless/lists/yomi-medbury.csv";
const LINK = "https://www.consultforafrica.com/ageless?i=yomi";
const INTRODUCED_BY = "Medbury Healthcare";

const TITLES = /^(dr|prof|professor|mrs|mr|ms|miss|chief|engr)\.?$/i;
/** "MRS EUCHARIA DURU" greets as Eucharia, "DR OPAWOYE" as Dr Opawoye. */
function greeting(full: string): string {
  const words = full.trim().split(/\s+/);
  const cap = (w: string) => (w === w.toUpperCase() ? w[0] + w.slice(1).toLowerCase() : w);
  const rest = words.filter((w) => !TITLES.test(w));
  if (rest.length === 1 && words.length > 1) return `${cap(words[0].replace(/\.$/, ""))} ${cap(rest[0])}`;
  return cap(rest[0] || full);
}
const surname = (full: string) => full.trim().split(/\s+/).pop()!.toLowerCase();

function rows() {
  const [, ...lines] = readFileSync(CSV, "utf8").trim().split(/\r?\n/);
  return lines.map((l) => {
    const cells = l.match(/("([^"]|"")*"|[^,]*)(,|$)/g)!.map((c) => c.replace(/,$/, "").replace(/^"|"$/g, "").replace(/""/g, '"'));
    return { name: cells[0], email: cells[1].toLowerCase(), company: cells[2] };
  });
}

async function main() {
  if ((send || test) && !process.env.ZEPTOMAIL_API_KEY) {
    console.error("No ZEPTOMAIL_API_KEY. Refusing to fall through to Zoho.");
    process.exit(1);
  }

  if (test) {
    await emailLyfeListInvite({ to: TEST_TO, firstName: "Debo", link: LINK, introducedBy: INTRODUCED_BY });
    console.log(`Sent to ${TEST_TO}. Link: ${LINK}`);
    return;
  }

  const list = rows();
  const enquiries = await prisma.lyfeEnquiry.findMany({ select: { email: true, fullName: true } });
  const regEmail = new Set(enquiries.map((e) => e.email.toLowerCase()));
  const regSurname = new Set(enquiries.map((e) => surname(e.fullName)));
  const suppressed = new Set(
    (await prisma.communicationSuppression.findMany({
      where: { email: { in: list.map((r) => r.email) } },
      select: { email: true },
    })).map((s) => (s.email ?? "").toLowerCase()),
  );
  const invited = new Set(
    (await prisma.$queryRawUnsafe<{ email: string }[]>(
      `select lower(email) email from "LyfeInvitation" where lower(email) = any($1)`,
      list.map((r) => r.email),
    )).map((r) => r.email),
  );

  const why = (r: (typeof list)[number]) =>
    regEmail.has(r.email) || regSurname.has(surname(r.name)) ? "registered"
      : suppressed.has(r.email) ? "suppressed"
        : invited.has(r.email) ? "already invited"
          : null;

  const targets = list.filter((r) => !why(r));
  console.log(`\nYomi's Medbury list: ${list.length}`);
  for (const r of list.filter(why)) console.log(`  skip (${why(r)})  ${r.name}`);
  console.log(`\nTo invite: ${targets.length}`);
  for (const r of targets) console.log(`  Dear ${greeting(r.name).padEnd(18)} ${r.company.padEnd(18)} ${r.email}`);

  if (!send) {
    console.log(`\nDry run. Link carried: ${LINK}`);
    return;
  }

  let ok = 0;
  for (const r of targets) {
    try {
      await emailLyfeListInvite({ to: r.email, firstName: greeting(r.name), link: LINK, introducedBy: INTRODUCED_BY });
      await prisma.$executeRawUnsafe(
        `insert into "LyfeInvitation" (id, email, name, source, "sentAt", "createdAt", "updatedAt")
         values (gen_random_uuid()::text, $1, $2, 'yomi', now(), now(), now())
         on conflict (email) do update set "sentAt" = now(), "updatedAt" = now()`,
        r.email, r.name,
      );
      ok++;
      console.log(`  SENT    ${r.name}`);
    } catch (err) {
      console.error(`  FAILED  ${r.name}: ${err instanceof Error ? err.message : err}`);
    }
    await new Promise((res) => setTimeout(res, 350));
  }
  console.log(`\n${ok} of ${targets.length} invited.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
