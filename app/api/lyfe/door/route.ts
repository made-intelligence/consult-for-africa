import { NextRequest, NextResponse } from "next/server";
import { timingSafeEqual } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { isRateLimited } from "@/lib/rate-limit";
import { clientIpFrom } from "@/lib/lyfe";
import { agelessHeldCode, normalisePassCode } from "@/lib/agelessPass";

/**
 * The AGELESS door: ushers look a guest up by pass code (scanned from the QR
 * or typed) or by name, and check them in.
 *
 * The credential is a door PIN in AGELESS_DOOR_PIN, shared with the ushers on
 * the night. A wrong PIN is rate limited hard. Checking in sets the row to
 * ATTENDED and stamps coordinatorNotes; undo puts it back to CONFIRMED.
 */
const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("stats"), pin: z.string() }),
  z.object({ action: z.literal("lookup"), pin: z.string(), code: z.string().max(200) }),
  z.object({ action: z.literal("search"), pin: z.string(), q: z.string().trim().min(2).max(60) }),
  z.object({ action: z.literal("admit"), pin: z.string(), id: z.string().max(40) }),
  z.object({ action: z.literal("undo"), pin: z.string(), id: z.string().max(40) }),
]);

const CHECKED_IN = "Checked in at the door";

function pinOk(pin: string): boolean {
  const want = process.env.AGELESS_DOOR_PIN;
  if (!want) return false;
  const a = Buffer.from(pin.trim());
  const b = Buffer.from(want);
  return a.length === b.length && timingSafeEqual(a, b);
}

type Row = {
  id: string;
  fullName: string;
  guestCount: number | null;
  isClinician: boolean | null;
  eventStage: string | null;
  sourceDetail: string | null;
  coordinatorNotes: string | null;
};

async function roomRows(): Promise<Row[]> {
  return prisma.lyfeEnquiry.findMany({
    where: { intent: "EVENT_RSVP", eventStage: { in: ["CONFIRMED", "ATTENDED"] } },
    select: {
      id: true, fullName: true, guestCount: true, isClinician: true,
      eventStage: true, sourceDetail: true, coordinatorNotes: true,
    },
  });
}

function checkedInAt(notes: string | null): string | null {
  const m = notes?.match(new RegExp(`\\[([^\\]]+) door\\] ${CHECKED_IN}`));
  return m ? m[1] : null;
}


function present(r: Row, all: Row[]) {
  const hostId = r.sourceDetail?.startsWith("guest-of:") ? r.sourceDetail.slice(9) : null;
  return {
    id: r.id,
    name: r.fullName.trim(),
    code: agelessHeldCode(r.id, r.coordinatorNotes),
    admits: 1 + (r.guestCount ?? 0),
    guestOf: hostId ? all.find((x) => x.id === hostId)?.fullName.trim() ?? null : null,
    clinician: !!r.isClinician,
    checkedIn: r.eventStage === "ATTENDED",
    checkedInAt: r.eventStage === "ATTENDED" ? checkedInAt(r.coordinatorNotes) : null,
  };
}

function stats(all: Row[]) {
  const heads = (rs: Row[]) => rs.reduce((n, r) => n + 1 + (r.guestCount ?? 0), 0);
  const inRoom = all.filter((r) => r.eventStage === "ATTENDED");
  return { expected: heads(all), arrived: heads(inRoom), passes: all.length, passesIn: inRoom.length };
}

export const POST = handler(async (req: NextRequest) => {
  const ip = clientIpFrom(req.headers);
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "That request did not look right." }, { status: 400 });
  const body = parsed.data;

  if (!pinOk(body.pin)) {
    if (isRateLimited(ip, "ageless-door-pin", { windowMs: 15 * 60 * 1000, max: 10 })) {
      return NextResponse.json({ error: "Too many wrong PINs. Wait fifteen minutes." }, { status: 429 });
    }
    return NextResponse.json({ error: "Wrong door PIN." }, { status: 401 });
  }
  if (isRateLimited(ip, "ageless-door", { windowMs: 60 * 1000, max: 120 })) {
    return NextResponse.json({ error: "Slow down a moment." }, { status: 429 });
  }

  const all = await roomRows();

  if (body.action === "stats") return NextResponse.json({ ok: true, stats: stats(all) });

  if (body.action === "lookup") {
    const code = normalisePassCode(body.code);
    if (!code) return NextResponse.json({ ok: true, found: false, reason: "That is not an AGELESS pass code." });
    const r = all.find((x) => agelessHeldCode(x.id, x.coordinatorNotes) === code);
    if (!r) return NextResponse.json({ ok: true, found: false, reason: `${code} is not on the guest list.` });
    return NextResponse.json({ ok: true, found: true, guest: present(r, all), stats: stats(all) });
  }

  if (body.action === "search") {
    const q = body.q.toLowerCase();
    const hits = all
      .filter((r) => r.fullName.toLowerCase().includes(q))
      .slice(0, 12)
      .map((r) => present(r, all));
    return NextResponse.json({ ok: true, guests: hits });
  }

  const r = all.find((x) => x.id === body.id);
  if (!r) return NextResponse.json({ error: "That guest is not on the list." }, { status: 404 });

  if (body.action === "admit") {
    if (r.eventStage === "ATTENDED") {
      return NextResponse.json({ ok: true, guest: present(r, all), already: true, stats: stats(all) });
    }
    const stamp = `[${new Date().toLocaleTimeString("en-GB", { timeZone: "Africa/Lagos", hour: "2-digit", minute: "2-digit" })} door] ${CHECKED_IN}.`;
    const notes = r.coordinatorNotes ? `${stamp}\n${r.coordinatorNotes}` : stamp;
    await prisma.lyfeEnquiry.update({ where: { id: r.id }, data: { eventStage: "ATTENDED", coordinatorNotes: notes } });
    const next = { ...r, eventStage: "ATTENDED", coordinatorNotes: notes };
    const after = all.map((x) => (x.id === r.id ? next : x));
    return NextResponse.json({ ok: true, guest: present(next, after), stats: stats(after) });
  }

  // undo
  const notes = (r.coordinatorNotes ?? "").replace(new RegExp(`^\\[[^\\]]+ door\\] ${CHECKED_IN}\\.\\n?`), "");
  await prisma.lyfeEnquiry.update({ where: { id: r.id }, data: { eventStage: "CONFIRMED", coordinatorNotes: notes || null } });
  const next = { ...r, eventStage: "CONFIRMED", coordinatorNotes: notes };
  const after = all.map((x) => (x.id === r.id ? next : x));
  return NextResponse.json({ ok: true, guest: present(next, after), stats: stats(after) });
});
