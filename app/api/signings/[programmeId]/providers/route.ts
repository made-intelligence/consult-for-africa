import { NextRequest } from "next/server";
import { z } from "zod";
import type { ProviderSigningStage } from "@prisma/client";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { STAGES, STAGE_LABELS, cadenceAt, newReturnToken, programmeAccess, returnLink } from "@/lib/signings";

/**
 * Import and export. The import takes the columns of the signing tracker
 * spreadsheet the team started on, so a sheet pasted in arrives intact, and a
 * facility already on the programme (same name and email) is updated rather
 * than duplicated.
 */

const STAGE_BY_LABEL = new Map<string, ProviderSigningStage>(
  STAGES.flatMap((s) => [
    [s.toLowerCase(), s],
    [STAGE_LABELS[s].toLowerCase(), s],
  ]),
);
STAGE_BY_LABEL.set("with aman", "WITH_CLIENT");
STAGE_BY_LABEL.set("signed", "SIGNED");

const Row = z.object({
  facility: z.string().trim().min(1).max(200),
  groupName: z.string().trim().max(200).optional(),
  facilityType: z.string().trim().max(80).optional(),
  lga: z.string().trim().max(80).optional(),
  area: z.string().trim().max(120).optional(),
  contactName: z.string().trim().max(160).optional(),
  contactRole: z.string().trim().max(120).optional(),
  phone: z.string().trim().max(60).optional(),
  email: z.string().trim().max(200).optional(),
  signatoryName: z.string().trim().max(160).optional(),
  signatoryPhone: z.string().trim().max(60).optional(),
  signatoryEmail: z.string().trim().max(200).optional(),
  source: z.string().trim().max(120).optional(),
  owner: z.string().trim().max(120).optional(),
  stage: z.string().trim().max(40).optional(),
  slaSentAt: z.string().trim().max(40).optional(),
  signedAt: z.string().trim().max(40).optional(),
  nextAction: z.string().trim().max(300).optional(),
  nextActionAt: z.string().trim().max(40).optional(),
  objection: z.string().trim().max(2000).optional(),
  notes: z.string().trim().max(4000).optional(),
});

const blank = (v?: string) => (v && v.trim() ? v.trim() : null);
const email = (v?: string) => {
  const e = blank(v)?.toLowerCase() ?? null;
  return e && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e) ? e : null;
};
function date(v?: string): Date | null {
  const s = blank(v);
  if (!s) return null;
  // dd/mm/yyyy, as Nigerian sheets write it, before falling back to the parser.
  const m = s.match(/^(\d{1,2})[/.-](\d{1,2})[/.-](\d{2,4})$/);
  const d = m ? new Date(`${m[3].length === 2 ? `20${m[3]}` : m[3]}-${m[2].padStart(2, "0")}-${m[1].padStart(2, "0")}T09:00:00+01:00`) : new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const POST = handler(async function POST(req: NextRequest, ctx: { params: Promise<{ programmeId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { programmeId } = await ctx.params;
  const access = await programmeAccess(programmeId, session.user);
  if (!access) return Response.json({ error: "Not found" }, { status: 404 });

  const parsed = z.object({ rows: z.array(Row).min(1).max(2000) }).safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid rows" }, { status: 400 });

  // Owners are matched by first name or full name against the people on the engagement.
  const team = await prisma.user.findMany({
    where: {
      OR: [
        { managedEngagements: { some: { signingProgrammes: { some: { id: programmeId } } } } },
        { assignments: { some: { status: "ACTIVE", engagement: { signingProgrammes: { some: { id: programmeId } } } } } },
      ],
    },
    select: { id: true, name: true },
  });
  const ownerOf = (name?: string | null) => {
    const n = blank(name ?? undefined)?.toLowerCase();
    if (!n) return null;
    return team.find((u) => u.name.toLowerCase() === n || u.name.toLowerCase().split(/\s+/).includes(n))?.id ?? null;
  };

  const existing = await prisma.providerSigning.findMany({
    where: { programmeId },
    select: { id: true, facility: true, email: true },
  });
  const keyOf = (f: string, e: string | null) => `${f.trim().toLowerCase()}|${e ?? ""}`;
  const byKey = new Map(existing.map((x) => [keyOf(x.facility, x.email), x.id]));

  let created = 0;
  let updated = 0;
  const unknownOwners = new Set<string>();
  for (const r of parsed.data.rows) {
    const stage = (r.stage && STAGE_BY_LABEL.get(r.stage.toLowerCase())) || "TARGET";
    const slaSentAt = date(r.slaSentAt) ?? (stage === "SLA_SENT" ? new Date() : null);
    const ownerId = ownerOf(r.owner);
    if (r.owner && !ownerId) unknownOwners.add(r.owner);
    const cadence = stage === "SLA_SENT" && slaSentAt ? cadenceAt(slaSentAt, 0) : null;
    const data = {
      facility: r.facility,
      groupName: blank(r.groupName),
      facilityType: blank(r.facilityType),
      lga: blank(r.lga),
      area: blank(r.area),
      contactName: blank(r.contactName),
      contactRole: blank(r.contactRole),
      phone: blank(r.phone),
      email: email(r.email),
      signatoryName: blank(r.signatoryName),
      signatoryPhone: blank(r.signatoryPhone),
      signatoryEmail: email(r.signatoryEmail),
      source: blank(r.source),
      ownerId,
      stage,
      slaSentAt,
      signedAt: date(r.signedAt) ?? (["SIGNED", "DOCS_COMPLETE", "WITH_CLIENT"].includes(stage) ? new Date() : null),
      nextAction: blank(r.nextAction) ?? cadence?.nextAction ?? null,
      nextActionAt: date(r.nextActionAt) ?? cadence?.nextActionAt ?? null,
      objection: blank(r.objection),
      notes: blank(r.notes),
    };
    const id = byKey.get(keyOf(r.facility, data.email));
    if (id) {
      // An update never blanks what is already there.
      const patch = Object.fromEntries(Object.entries(data).filter(([, v]) => v !== null));
      await prisma.providerSigning.update({ where: { id }, data: patch });
      updated++;
    } else {
      const row = await prisma.providerSigning.create({ data: { ...data, programmeId, returnToken: newReturnToken() } });
      byKey.set(keyOf(r.facility, data.email), row.id);
      await prisma.providerSigningEvent.create({
        data: { signingId: row.id, kind: "NOTE", note: "Imported", actorId: session.user.id },
      });
      created++;
    }
  }
  return Response.json({ ok: true, created, updated, unknownOwners: [...unknownOwners] });
});

/** The whole programme as CSV, including each provider's return link. */
export const GET = handler(async function GET(_req: NextRequest, ctx: { params: Promise<{ programmeId: string }> }) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const { programmeId } = await ctx.params;
  const access = await programmeAccess(programmeId, session.user);
  if (!access) return Response.json({ error: "Not found" }, { status: 404 });

  const rows = await prisma.providerSigning.findMany({
    where: { programmeId },
    include: { owner: { select: { name: true } } },
    orderBy: { facility: "asc" },
  });
  const cols = [
    "Facility", "Group", "Type", "LGA", "Area", "Contact name", "Contact role", "Phone", "Email",
    "Signatory", "Signatory phone", "Signatory email", "Source", "Owner", "Stage", "SLA sent", "SLA signed",
    "Next action", "Next action date", "Chases sent", "Objection", "Notes", "Return link",
  ];
  const d = (x: Date | null) => (x ? x.toISOString().slice(0, 10) : "");
  const cell = (v: unknown) => {
    const s = v == null ? "" : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")].concat(
    rows.map((r) =>
      [
        r.facility, r.groupName, r.facilityType, r.lga, r.area, r.contactName, r.contactRole, r.phone, r.email,
        r.signatoryName, r.signatoryPhone, r.signatoryEmail, r.source, r.owner?.name, STAGE_LABELS[r.stage],
        d(r.slaSentAt), d(r.signedAt), r.nextAction, d(r.nextActionAt), r.chaseCount, r.objection, r.notes,
        returnLink(r.returnToken),
      ].map(cell).join(","),
    ),
  );
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${access.programme.name.replace(/[^a-z0-9]+/gi, "-")}-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
});
