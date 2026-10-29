import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getStaffSession } from "@/lib/staffAuth";

// Team notes. Signed in to post or read: these are colleagues talking to each
// other, not something a link-holder should see.

export const dynamic = "force-dynamic";

const postSchema = z.object({
  body: z.string().trim().min(1).max(2000),
  scope: z.enum(["DEPARTMENT", "ALL"]).default("DEPARTMENT"),
  parentId: z.string().min(1).optional(),
});

export async function POST(req: NextRequest) {
  const session = await getStaffSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const parsed = postSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Write something first." }, { status: 400 });

  const me = await prisma.staffMember.findUnique({
    where: { id: session.sub },
    select: { department: true, clientId: true },
  });
  if (!me || me.clientId !== session.clientId) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // A reply inherits its parent's audience. Otherwise somebody answers a
  // department note to the whole hospital without meaning to.
  let scope = parsed.data.scope;
  let department: string | null = scope === "DEPARTMENT" ? me.department : null;

  if (parsed.data.parentId) {
    const parent = await prisma.staffNote.findUnique({
      where: { id: parsed.data.parentId },
      select: { id: true, clientId: true, scope: true, department: true, parentId: true },
    });
    if (!parent || parent.clientId !== session.clientId) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    // One level deep. A thread of threads in a nineteen person hospital is a
    // thing nobody reads.
    if (parent.parentId) {
      return NextResponse.json({ error: "Reply to the original note." }, { status: 400 });
    }
    scope = parent.scope;
    department = parent.department;
  }

  await prisma.staffNote.create({
    data: {
      clientId: session.clientId,
      authorId: session.sub,
      body: parsed.data.body.trim(),
      scope,
      department,
      parentId: parsed.data.parentId ?? null,
    },
  });

  return NextResponse.json({ ok: true });
}
