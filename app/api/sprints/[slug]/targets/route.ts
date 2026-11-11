import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { importKey, splitEmails, splitPhones } from "@/lib/hospital-sales";
import { sprintAccess } from "@/lib/outreach-server";

// Add a provider to the sprint. It goes into the CFA directory too (matched on
// name + LGA, so a provider already there is reused), and onto one list only.

const body = z.object({
  name: z.string().trim().min(2, "Give the provider's name").max(160),
  lga: z.string().trim().max(80).optional().default(""),
  category: z.string().trim().max(60).optional().default(""),
  phone: z.string().trim().max(200).optional().default(""),
  email: z.string().trim().max(300).optional().default(""),
  source: z.string().trim().max(80).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  ownerId: z.string().optional(),
});

export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug } = await ctx.params;
  const a = await sprintAccess(slug, session.user);
  if (!a) return Response.json({ error: "You are not on this sprint" }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const b = parsed.data;

  // A caller adds to their own list; the lead or runner can add to anyone's.
  const ownerId = a.steer && b.ownerId ? b.ownerId : session.user.id;
  const m = await prisma.sprintMember.findUnique({ where: { sprintId_userId: { sprintId: a.sprint.id, userId: ownerId } } });
  if (!m) return Response.json({ error: "The owner must be on the sprint" }, { status: 400 });

  const name = b.name.replace(/\s+/g, " ");
  const key = importKey(name, b.lga || null);
  const hospital =
    (await prisma.hospital.findUnique({ where: { importKey: key } })) ??
    (await prisma.hospital.create({ data: { name, state: "Lagos", lga: b.lga || null, city: b.lga ? "Lagos" : null, category: b.category || null, source: `Sprint: ${a.sprint.name}`, importKey: key, importedAt: new Date() } }));

  const existing = await prisma.sprintTarget.findUnique({ where: { sprintId_hospitalId: { sprintId: a.sprint.id, hospitalId: hospital.id } }, include: { owner: { select: { name: true } } } });
  if (existing) return Response.json({ error: `Already on the sprint, on ${existing.owner?.name ?? "nobody"}'s list`, targetId: existing.id }, { status: 409 });

  const emails = splitEmails(b.email);
  const phones = splitPhones(b.phone);
  const have = await prisma.hospitalContact.findMany({ where: { hospitalId: hospital.id }, select: { email: true, phone: true } });
  const contacts = [
    ...emails.filter((e) => !have.some((h) => h.email === e)).map((email, i) => ({ hospitalId: hospital.id, email, phone: i === 0 ? phones[0] ?? null : null, source: "sprint" })),
    ...phones.slice(emails.length ? 1 : 0).filter((p) => !have.some((h) => h.phone === p)).map((phone) => ({ hospitalId: hospital.id, phone, email: null, source: "sprint" })),
  ];
  if (contacts.length) await prisma.hospitalContact.createMany({ data: contacts, skipDuplicates: true });

  const t = await prisma.sprintTarget.create({
    data: { sprintId: a.sprint.id, hospitalId: hospital.id, ownerId, area: m.area, source: b.source || "Added on the desk", notes: b.notes || null, priority: 5 },
  });
  return Response.json({ ok: true, targetId: t.id });
});
