import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getSiteSession, type StaffSession } from "@/lib/staffAuth";
import { ARABELLA } from "@/lib/staffSites";

// Leadership onboards the team: adds a person, fills in the phone or email that
// lets them sign in, sets what they can see, or takes them off the list.
//
// Who may grant what is the restriction on sensitive information:
//   LEADERSHIP adds and edits people at ALL_STAFF or SUPERVISOR.
//   Only the principal (BOARD) can give anyone LEADERSHIP, which is what opens
//   the money and the daily view. BOARD is never granted here at all.
//   Nobody changes their own access or takes themselves off.

export const dynamic = "force-dynamic";

const GRANTABLE = ["ALL_STAFF", "SUPERVISOR", "LEADERSHIP"] as const;
type Grantable = (typeof GRANTABLE)[number];

const phone = z.string().trim().max(30).regex(/^[+\d\s()-]*$/, "Numbers only").optional().or(z.literal(""));
const email = z.string().trim().max(200).email().optional().or(z.literal(""));

const add = z.object({
  name: z.string().trim().min(2).max(120),
  position: z.string().trim().min(2).max(120),
  department: z.string().trim().min(2).max(60),
  phone,
  email,
  tier: z.enum(GRANTABLE).default("ALL_STAFF"),
});

const edit = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(2).max(120).optional(),
  position: z.string().trim().min(2).max(120).optional(),
  department: z.string().trim().min(2).max(60).optional(),
  phone,
  email,
  tier: z.enum(GRANTABLE).optional(),
  active: z.boolean().optional(),
});

function isLeader(s: StaffSession) {
  return s.tiers.includes("LEADERSHIP") || s.tiers.includes("BOARD");
}

function mayGrant(s: StaffSession, tier: Grantable) {
  return tier === "LEADERSHIP" ? s.tiers.includes("BOARD") : isLeader(s);
}

/** The tiers a person holds once this edit lands. BOARD, if held, is kept. */
function nextTiers(current: string[], tier: Grantable) {
  const board = current.includes("BOARD") ? ["BOARD" as const] : [];
  return [tier, ...board];
}

const clean = (v: string | undefined) => (v && v.trim() ? v.trim() : null);

async function phoneTaken(clientId: string, value: string | null, exceptId?: string) {
  if (!value) return false;
  const key = value.replace(/\D/g, "").slice(-10);
  if (key.length < 10) return false;
  const rows = await prisma.staffMember.findMany({
    where: { clientId, isActive: true, phone: { not: null }, ...(exceptId ? { id: { not: exceptId } } : {}) },
    select: { phone: true },
  });
  return rows.some((r) => (r.phone ?? "").replace(/\D/g, "").slice(-10) === key);
}

export async function POST(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!isLeader(session)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const parsed = add.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Name, job title and area are needed. Check the phone and email." }, { status: 400 });
  const d = parsed.data;
  if (!mayGrant(session, d.tier)) return NextResponse.json({ error: "Only Dr Chito can give leadership access." }, { status: 403 });

  const p = clean(d.phone);
  const e = clean(d.email)?.toLowerCase() ?? null;
  if (await phoneTaken(session.clientId, p)) return NextResponse.json({ error: "Someone on the list already has that number." }, { status: 409 });

  const row = await prisma.staffMember.create({
    data: {
      clientId: session.clientId, name: d.name, position: d.position, department: d.department,
      phone: p, email: e, tiers: [d.tier], kind: "EMPLOYEE",
    },
    select: { id: true },
  });
  return NextResponse.json({ ok: true, id: row.id });
}

export async function PATCH(req: NextRequest) {
  const session = await getSiteSession(ARABELLA);
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  if (!isLeader(session)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });

  const parsed = edit.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Check the phone and email." }, { status: 400 });
  const d = parsed.data;

  const row = await prisma.staffMember.findUnique({ where: { id: d.id }, select: { clientId: true, tiers: true } });
  if (!row || row.clientId !== session.clientId) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const self = d.id === session.sub;
  if (self && (d.tier !== undefined || d.active === false)) {
    return NextResponse.json({ error: "You cannot change your own access." }, { status: 403 });
  }
  // Leadership can edit a fellow leader's contact details but not their access;
  // that, and anything touching the principal, is hers.
  const targetIsLeader = row.tiers.includes("LEADERSHIP") || row.tiers.includes("BOARD");
  if (!self && targetIsLeader && !session.tiers.includes("BOARD") && (d.tier !== undefined || d.active !== undefined)) {
    return NextResponse.json({ error: "Only Dr Chito can change a leader's access." }, { status: 403 });
  }
  if (d.tier && !mayGrant(session, d.tier)) return NextResponse.json({ error: "Only Dr Chito can give leadership access." }, { status: 403 });

  const p = d.phone === undefined ? undefined : clean(d.phone);
  if (p && (await phoneTaken(session.clientId, p, d.id))) return NextResponse.json({ error: "Someone on the list already has that number." }, { status: 409 });

  await prisma.staffMember.update({
    where: { id: d.id },
    data: {
      ...(d.name ? { name: d.name } : {}),
      ...(d.position ? { position: d.position } : {}),
      ...(d.department ? { department: d.department } : {}),
      ...(p !== undefined ? { phone: p } : {}),
      ...(d.email !== undefined ? { email: clean(d.email)?.toLowerCase() ?? null } : {}),
      ...(d.tier ? { tiers: nextTiers(row.tiers, d.tier) } : {}),
      ...(d.active !== undefined ? { isActive: d.active } : {}),
    },
  });
  return NextResponse.json({ ok: true });
}
