/**
 * The AGELESS guest list as a workbook, for the door and for the team.
 *
 *   npx tsx --env-file=.env.local scripts/export-ageless-list.ts
 *
 * Writes docs/ageless/lists/AGELESS - Guest List.xlsx with three sheets:
 * the door list (confirmed, by surname, with pass codes and a tick column),
 * every registration, and the headline numbers. Personal data: the lists
 * folder is not committed.
 */
import { createHash } from "crypto";
import { mkdirSync } from "fs";
import * as XLSX from "xlsx";
import { PrismaClient } from "@prisma/client";
import { LYFE_EVENT } from "@/lib/lyfe";

const prisma = new PrismaClient();
const OUT = "docs/ageless/lists/AGELESS - Guest List.xlsx";

const ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
function passCode(id: string, notes?: string | null): string {
  // Guests re-created after the 20 October reset hold their original code.
  const held = notes?.match(/Original pass code: (AGL-[2-9A-HJ-NP-Z]{4})/)?.[1];
  if (held) return held;
  const h = createHash("sha256").update(`ageless:${id}`).digest();
  return "AGL-" + Array.from(h.subarray(0, 4), (b) => ALPHABET[b % ALPHABET.length]).join("");
}
const surname = (n: string) => n.trim().split(/\s+/).slice(-1)[0]?.toLowerCase() ?? "";
const d = (x: Date | null) => (x ? x.toISOString().slice(0, 16).replace("T", " ") : "");

async function main() {
  const rows = await prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP" },
    orderBy: { createdAt: "asc" },
    select: {
      id: true, fullName: true, email: true, phone: true, guestCount: true, isClinician: true,
      eventStage: true, source: true, sourceDetail: true, utmSource: true,
      createdAt: true, confirmedAt: true, coordinatorNotes: true,
    },
  });
  const byId = new Map(rows.map((r) => [r.id, r.fullName.trim()]));
  const guestOf = (sd: string | null) => (sd?.startsWith("guest-of:") ? byId.get(sd.slice(9)) ?? "" : "");
  const hasPass = (n: string | null) => !!n?.includes("Access pass sent");

  const confirmed = rows
    .filter((r) => r.eventStage === "CONFIRMED" || r.eventStage === "ATTENDED")
    .sort((a, b) => surname(a.fullName).localeCompare(surname(b.fullName)));

  const door = confirmed.map((r, i) => ({
    "#": i + 1,
    Name: r.fullName.trim(),
    "Pass code": passCode(r.id, r.coordinatorNotes),
    Admits: 1 + (r.guestCount ?? 0),
    "Unnamed guests": r.guestCount ?? 0,
    "Guest of": guestOf(r.sourceDetail),
    Phone: r.phone,
    Email: r.email,
    Clinician: r.isClinician ? "Yes" : "",
    "Pass sent": hasPass(r.coordinatorNotes) ? "Yes" : "NO",
    "Checked in": r.eventStage === "ATTENDED" ? "Yes" : "",
  }));

  const all = rows.map((r) => ({
    Name: r.fullName.trim(),
    Email: r.email,
    Phone: r.phone,
    Stage: r.eventStage ?? "",
    "Pass code": r.eventStage === "CONFIRMED" || r.eventStage === "ATTENDED" ? passCode(r.id, r.coordinatorNotes) : "",
    Admits: 1 + (r.guestCount ?? 0),
    "Guest of": guestOf(r.sourceDetail),
    Clinician: r.isClinician ? "Yes" : "",
    Source: r.source,
    "Source detail": r.sourceDetail?.startsWith("guest-of:") ? "named by host" : r.sourceDetail ?? "",
    "UTM source": r.utmSource ?? "",
    Registered: d(r.createdAt),
    Confirmed: d(r.confirmedAt),
    "Pass sent": hasPass(r.coordinatorNotes) ? "Yes" : "",
  }));

  const heads = confirmed.reduce((n, r) => n + 1 + (r.guestCount ?? 0), 0);
  const summary = [
    { Item: "Event", Value: `AGELESS, ${LYFE_EVENT.date}, ${LYFE_EVENT.venueName}` },
    { Item: "Places", Value: LYFE_EVENT.places },
    { Item: "Confirmed registrations", Value: confirmed.length },
    { Item: "Heads, including unnamed guests", Value: heads },
    { Item: "Guests still to be named by hosts", Value: confirmed.reduce((n, r) => n + (r.guestCount ?? 0), 0) },
    { Item: "Clinicians", Value: confirmed.filter((r) => r.isClinician).length },
    { Item: "All registrations", Value: rows.length },
    { Item: "Exported", Value: d(new Date()) + " UTC" },
  ];

  const wb = XLSX.utils.book_new();
  const sheet = (data: object[], widths: number[]) => {
    const ws = XLSX.utils.json_to_sheet(data);
    ws["!cols"] = widths.map((wch) => ({ wch }));
    return ws;
  };
  XLSX.utils.book_append_sheet(wb, sheet(door, [4, 30, 11, 7, 9, 24, 16, 32, 9, 9, 10]), "Door list");
  XLSX.utils.book_append_sheet(wb, sheet(all, [30, 32, 16, 12, 11, 7, 24, 9, 16, 22, 12, 16, 16, 9]), "All registrations");
  XLSX.utils.book_append_sheet(wb, sheet(summary, [34, 50]), "Summary");
  mkdirSync("docs/ageless/lists", { recursive: true });
  XLSX.writeFile(wb, OUT);
  console.log(`${OUT}: ${door.length} on the door list, ${heads} heads, ${rows.length} registrations.`);
}

main().finally(() => prisma.$disconnect());
