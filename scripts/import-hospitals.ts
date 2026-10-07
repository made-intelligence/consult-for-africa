/**
 * Import a hospital list into the sales directory.
 *
 *   npx tsx --env-file=.env.local scripts/import-hospitals.ts <file.xlsx|.csv> [--sheet "Provider Contacts"] [--state Lagos] [--source "label"] [--commit]
 *
 * Dry run by default: prints what it would create, update and skip. Pass
 * --commit to write. Re-running with a fuller list updates in place, because
 * hospitals are matched on a normalised name + LGA key and contacts on
 * (hospital, email).
 *
 * Columns are found by header name, case insensitive, so most lists work as
 * they are: name/provider/hospital/facility, email, phone/telephone/mobile,
 * lga/area/location, city/town, state, address, category/type, contact
 * person/contact name, role/title, website.
 *
 * Every imported hospital is set as a TARGET for each live product it is not
 * already in, so it shows up in the claims recovery funnel straight away.
 */

import * as XLSX from "xlsx";
import { prisma } from "@/lib/prisma";
import { PRODUCTS, importKey, splitEmails, splitPhones } from "@/lib/hospital-sales";

const args = process.argv.slice(2);
const file = args.find((a) => !a.startsWith("--"));
const flag = (n: string) => {
  const i = args.indexOf(`--${n}`);
  return i >= 0 ? args[i + 1] : undefined;
};
const COMMIT = args.includes("--commit");

if (!file) {
  console.error("Usage: import-hospitals.ts <file> [--sheet name] [--state Lagos] [--source label] [--commit]");
  process.exit(1);
}

const HEADERS: Record<string, string[]> = {
  name: ["name", "provider", "hospital", "facility", "facility name", "hospital name", "provider name", "organisation", "organization"],
  email: ["email", "e-mail", "email address", "emails"],
  phone: ["phone", "telephone", "mobile", "phone number", "phone numbers", "contact number", "tel"],
  lga: ["lga", "area", "location", "target location", "local government"],
  city: ["city", "town"],
  state: ["state"],
  address: ["address", "address (from source)"],
  category: ["category", "type", "facility type"],
  contactName: ["contact person", "contact name", "contact"],
  role: ["role", "title", "designation", "position"],
  website: ["website", "web", "url"],
  /** Free text about earlier contact; becomes one HospitalContactLog entry. */
  history: ["history", "contact history"],
};

type Row = Record<keyof typeof HEADERS, string | null>;

function readRows(): Row[] {
  const wb = XLSX.readFile(file!);
  const sheetName = flag("sheet") ?? wb.SheetNames.find((n) => /contact|provider|hospital|list/i.test(n)) ?? wb.SheetNames[0];
  const sheet = wb.Sheets[sheetName];
  if (!sheet) throw new Error(`No sheet "${sheetName}". Sheets: ${wb.SheetNames.join(", ")}`);
  const grid = XLSX.utils.sheet_to_json<(string | number | null)[]>(sheet, { header: 1, defval: null, raw: false });
  // The header is the first row that names a hospital column.
  const hi = grid.findIndex((r) => r.some((c) => HEADERS.name.includes(String(c ?? "").trim().toLowerCase())));
  if (hi < 0) throw new Error("Could not find a header row with a name/provider/hospital column");
  const head = grid[hi].map((c) => String(c ?? "").trim().toLowerCase());
  const col = Object.fromEntries(
    Object.entries(HEADERS).map(([k, names]) => [k, head.findIndex((h) => names.includes(h))]),
  ) as Record<keyof typeof HEADERS, number>;
  console.log(`Sheet "${sheetName}", header on row ${hi + 1}. Columns:`, Object.fromEntries(Object.entries(col).filter(([, i]) => i >= 0).map(([k, i]) => [k, head[i]])));
  return grid.slice(hi + 1).map((r) => {
    const o = {} as Row;
    for (const k of Object.keys(HEADERS) as (keyof typeof HEADERS)[]) {
      const v = col[k] >= 0 ? r[col[k]] : null;
      o[k] = v == null || String(v).trim() === "" ? null : String(v).trim();
    }
    return o;
  });
}

async function main() {
  const rows = readRows().filter((r) => r.name);
  const state = flag("state") ?? "Lagos";
  const source = flag("source") ?? file!.split("/").pop()!;
  const live = Object.entries(PRODUCTS).filter(([, p]) => p.live).map(([k]) => k);

  // One entry per hospital key; later rows for the same hospital add contacts.
  type Entry = { key: string; r: Row; emails: string[]; phones: string[] };
  const byKey = new Map<string, Entry>();
  for (const r of rows) {
    const key = importKey(r.name!.replace(/\s+/g, " "), r.lga ?? r.city);
    const e = byKey.get(key) ?? { key, r, emails: [], phones: [] };
    e.emails = [...new Set([...e.emails, ...splitEmails(r.email)])];
    e.phones = [...new Set([...e.phones, ...splitPhones(r.phone)])];
    byKey.set(key, e);
  }
  const entries = [...byKey.values()];
  const existing = new Map(
    (await prisma.hospital.findMany({ where: { importKey: { in: entries.map((e) => e.key) } }, select: { id: true, importKey: true } })).map((h) => [h.importKey!, h.id]),
  );
  const fresh = entries.filter((e) => !existing.has(e.key));
  const stats = {
    rows: rows.length,
    hospitals: entries.length,
    alreadyThere: existing.size,
    toCreate: fresh.length,
    withEmail: entries.filter((e) => e.emails.length).length,
    withPhone: entries.filter((e) => e.phones.length).length,
    withNeither: entries.filter((e) => !e.emails.length && !e.phones.length).length,
    contactsCreated: 0,
    logsCreated: 0,
  };
  if (!COMMIT) {
    console.log("DRY RUN (pass --commit to write)", stats);
    return;
  }

  // Bulk writes, so a slow or flaky connection is not held open per row.
  // Every step is idempotent: re-running after a failure picks up where it stopped.
  const now = new Date();
  for (let i = 0; i < fresh.length; i += 200) {
    await prisma.hospital.createMany({
      data: fresh.slice(i, i + 200).map(({ key, r }) => ({
        name: r.name!.replace(/\s+/g, " "),
        state: r.state ?? state,
        lga: r.lga,
        city: r.city ?? (r.lga ? state : null),
        address: r.address,
        category: r.category,
        website: r.website,
        source,
        importKey: key,
        importedAt: now,
      })),
      skipDuplicates: true,
    });
  }
  const ids = new Map(
    (await prisma.hospital.findMany({ where: { importKey: { in: entries.map((e) => e.key) } }, select: { id: true, importKey: true } })).map((h) => [h.importKey!, h.id]),
  );
  const have = await prisma.hospitalContact.findMany({ where: { hospitalId: { in: [...ids.values()] } }, select: { hospitalId: true, email: true, phone: true } });
  const seen = new Set(have.flatMap((c) => [c.email ? `${c.hospitalId}|e|${c.email}` : "", c.phone ? `${c.hospitalId}|p|${c.phone}` : ""]).filter(Boolean));

  const contacts: { hospitalId: string; email: string | null; phone: string | null; name: string | null; role: string | null; isPrimary: boolean; source: string }[] = [];
  for (const e of entries) {
    const hospitalId = ids.get(e.key)!;
    const phones = e.phones.filter((p) => !seen.has(`${hospitalId}|p|${p}`));
    e.emails.forEach((email, i) => {
      if (seen.has(`${hospitalId}|e|${email}`)) return;
      contacts.push({ hospitalId, email, phone: i === 0 ? phones.shift() ?? null : null, name: e.r.contactName, role: e.r.role, isPrimary: i === 0, source });
    });
    for (const phone of phones) contacts.push({ hospitalId, email: null, phone, name: e.r.contactName, role: e.r.role, isPrimary: !e.emails.length, source });
  }
  for (let i = 0; i < contacts.length; i += 500) {
    stats.contactsCreated += (await prisma.hospitalContact.createMany({ data: contacts.slice(i, i + 500), skipDuplicates: true })).count;
  }

  for (const product of live) {
    await prisma.hospitalProductStage.createMany({ data: [...ids.values()].map((hospitalId) => ({ hospitalId, product, stage: "TARGET" })), skipDuplicates: true });
  }

  // History goes on only once per hospital, so a re-run does not repeat it.
  const logged = new Set((await prisma.hospitalContactLog.findMany({ where: { hospitalId: { in: [...ids.values()] }, contactedBy: source }, select: { hospitalId: true } })).map((l) => l.hospitalId));
  const logs = entries.filter((e) => e.r.history && !logged.has(ids.get(e.key)!)).map((e) => ({ hospitalId: ids.get(e.key)!, contactedBy: source, channel: "NOTE", summary: e.r.history!.slice(0, 2000) }));
  if (logs.length) stats.logsCreated = (await prisma.hospitalContactLog.createMany({ data: logs })).count;

  console.log("COMMITTED", stats);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
