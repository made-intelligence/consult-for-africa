import { z } from "zod";
import bcrypt from "bcryptjs";
import { handler } from "@/lib/api-handler";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { setCrewSession } from "@/lib/estate/access";
import { clientIp } from "@/lib/estate/gate";

/**
 * The PIN gate on a shared gatehouse handset.
 *
 * NO PLATFORM AUTH — the link is the credential and the PIN is the second half
 * of it. Rate limited hard: four digits is guessable in ten thousand tries, so
 * the limiter, not the PIN, is what actually makes this stand up.
 */

const schema = z.object({ pin: z.string().min(4).max(6) });

export const POST = handler(async function POST(
  req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "estate-unlock", { windowMs: 10 * 60_000, max: 10 })) {
    return Response.json(
      { error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  const { token } = await params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Enter your PIN." }, { status: 400 });

  const staff = await prisma.estateStaff.findUnique({
    where: { accessToken: token },
    select: { id: true, name: true, active: true, pinHash: true },
  });
  if (!staff || !staff.active) {
    return Response.json({ error: "This link is not recognised." }, { status: 404 });
  }

  if (staff.pinHash && !(await bcrypt.compare(parsed.data.pin, staff.pinHash))) {
    return Response.json({ error: "That PIN is not right." }, { status: 401 });
  }

  await setCrewSession({ sub: staff.id, name: staff.name });

  return Response.json({ ok: true, name: staff.name });
});
