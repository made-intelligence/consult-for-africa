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

  const stats = { rows: rows.length, hospitalsNew: 0, hospitalsUpdated: 0, contactsNew: 0, withEmail: 0, withPhone: 0, withNeither: 0 };
  const seen = new Set<string>();

  for (const r of rows) {
    const name = r.name!.replace(/\s+/g, " ");
    const key = importKey(name, r.lga ?? r.city);
    if (seen.has(key)) continue;
    seen.add(key);
    const emails = splitEmails(r.email);
    const phones = splitPhones(r.phone);
    if (emails.length) stats.withEmail++;
    if (phones.length) stats.withPhone++;
    if (!emails.length && !phones.length) stats.withNeither++;

    const existing = await prisma.hospital.findUnique({ where: { importKey: key }, select: { id: true } });
    if (existing) stats.hospitalsUpdated++;
    else stats.hospitalsNew++;
    if (!COMMIT) {
      stats.contactsNew += Math.max(emails.length, phones.length ? 1 : 0);
      continue;
    }

    await prisma.$transaction(async (tx) => {
      const data = {
        name,
        state: r.state ?? state,
        lga: r.lga,
        city: r.city ?? (r.lga ? state : null),
        address: r.address,
        category: r.category,
        website: r.website,
        source,
        importedAt: new Date(),
      };
      const h = existing
        ? await tx.hospital.update({ where: { id: existing.id }, data: Object.fromEntries(Object.entries(data).filter(([, v]) => v != null)) })
        : await tx.hospital.create({ data: { ...data, importKey: key } });

      // One contact per email; phones ride on the first. A list with phones and
      // no email still gets a contact so the call and WhatsApp queue can use it.
      const contacts = emails.length ? emails.map((e, i) => ({ email: e, phone: i === 0 ? phones[0] ?? null : null })) : phones.length ? [{ email: null, phone: phones[0] }] : [];
      for (const c of contacts) {
        const found = await tx.hospitalContact.findFirst({
          where: { hospitalId: h.id, ...(c.email ? { email: c.email } : { email: null, phone: c.phone }) },
          select: { id: true },
        });
        if (found) continue;
        await tx.hospitalContact.create({
          data: { hospitalId: h.id, email: c.email, phone: c.phone, name: r.contactName, role: r.role, isPrimary: true, source },
        });
        stats.contactsNew++;
      }
      // Extra phones beyond the first go on a phone-only contact so none are lost.
      for (const p of phones.slice(1)) {
        const has = await tx.hospitalContact.findFirst({ where: { hospitalId: h.id, phone: p }, select: { id: true } });
        if (!has) await tx.hospitalContact.create({ data: { hospitalId: h.id, phone: p, source } });
      }
      for (const product of live) {
        await tx.hospitalProductStage.upsert({
          where: { hospitalId_product: { hospitalId: h.id, product } },
          create: { hospitalId: h.id, product, stage: "TARGET" },
          update: {},
        });
      }
    });
  }

  console.log(COMMIT ? "COMMITTED" : "DRY RUN (pass --commit to write)", stats);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
