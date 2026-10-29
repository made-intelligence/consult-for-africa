import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { ALL_STAFF_ROLES, OFFICE_ROLES } from "@/lib/constants";
import { claimUrl, ensureClaimToken } from "@/lib/cadreHealth/internship/listing";

const ALLOWED = [...ALL_STAFF_ROLES, ...OFFICE_ROLES] as readonly string[];

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("link") }),
  // The fallback when a centre agreed by phone, letter or in a meeting. Who
  // agreed and how are required, because the listing rests on them.
  z.object({
    action: z.literal("record"),
    consentName: z.string().trim().min(2).max(120),
    consentRole: z.string().trim().min(2).max(120),
    note: z.string().trim().min(5).max(1000),
  }),
  z.object({ action: z.literal("unlist"), note: z.string().trim().min(3).max(1000) }),
]);

/** POST /api/cadre/admin/internships/centres/[id]/listing: the centre's claim link, and its public listing. */
export const POST = handler(async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session || !ALLOWED.includes(session.user.role)) return Response.json({ error: "Not allowed." }, { status: 403 });
  const parsed = schema.safeParse(await req.json());
  if (!parsed.success) return Response.json({ error: "Say who agreed, their role, and how." }, { status: 400 });
  const d = parsed.data;
  const { id } = await params;
  const centre = await prisma.cadreInternshipCentre.findUnique({ where: { id }, select: { id: true, notes: true, stage: true } });
  if (!centre) return Response.json({ error: "Not found." }, { status: 404 });

  if (d.action === "link") return Response.json({ ok: true, url: claimUrl(await ensureClaimToken(id)) });

  const stamp = `${new Date().toISOString().slice(0, 10)} ${session.user.name ?? "Staff"}`;
  if (d.action === "record") {
    await prisma.cadreInternshipCentre.update({
      where: { id },
      data: {
        listed: true,
        consentAt: new Date(),
        consentName: d.consentName,
        consentRole: d.consentRole,
        consentSource: "RECORDED",
        consentById: session.user.id,
        consentNote: d.note,
        ...(centre.stage === "PROSPECT" || centre.stage === "CONTACTED" ? { stage: "MEETING" } : {}),
      },
    });
  } else {
    await prisma.cadreInternshipCentre.update({
      where: { id },
      data: { listed: false, notes: [centre.notes, `${stamp}: taken off the public list. ${d.note}`].filter(Boolean).join("\n") },
    });
  }
  return Response.json({ ok: true });
});
