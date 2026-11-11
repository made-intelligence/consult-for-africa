import { NextRequest } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { handler } from "@/lib/api-handler";
import { generateUploadUrl, objectExists } from "@/lib/r2";
import { emailsFor, isTested, privateKey } from "@/lib/outreach-hospital";
import { sprintAccess } from "@/lib/outreach-server";

// What hospitals see and receive: the agreement, the checklist, the pitch and
// the three emails, and the switch for automatic emails. Lead, runner or admin.

const email = z.object({ subject: z.string().trim().min(3).max(200), body: z.string().trim().min(20).max(4000) });
const body = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("save"),
    pitch: z.string().trim().max(2000).optional(),
    checklist: z.string().trim().max(3000).optional(),
    emails: z.object({ intro: email, sla: email, chase: email }).partial().optional(),
    autoChaseOn: z.boolean().optional(),
  }),
  z.object({ action: z.literal("agreement-url"), fileName: z.string().min(1).max(200), contentType: z.literal("application/pdf"), size: z.number().int().positive().max(15 * 1024 * 1024) }),
  z.object({ action: z.literal("agreement-confirm"), key: z.string().min(1).max(300), fileName: z.string().min(1).max(200) }),
]);

export const POST = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session) return Response.json({ error: "Please sign in" }, { status: 401 });
  const { slug } = await ctx.params;
  const a = await sprintAccess(slug, session.user);
  if (!a) return Response.json({ error: "You are not on this sprint" }, { status: 403 });
  if (!a.steer) return Response.json({ error: "Only the lead or the runner can change this" }, { status: 403 });
  const parsed = body.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Invalid" }, { status: 400 });
  const b = parsed.data;
  const s = a.sprint;

  if (b.action === "agreement-url") {
    const key = privateKey(s.id);
    return Response.json({ key, url: await generateUploadUrl(key, b.contentType, 900, b.size) });
  }
  if (b.action === "agreement-confirm") {
    if (!b.key.startsWith(`sprints/${s.id}/`) || !(await objectExists(b.key))) return Response.json({ error: "The upload did not arrive. Try again." }, { status: 400 });
    await prisma.outreachSprint.update({ where: { id: s.id }, data: { agreementKey: b.key, agreementName: b.fileName } });
    return Response.json({ ok: true });
  }

  const emails = { ...emailsFor(s), ...(b.emails ?? {}) };
  // Automatic reminders only run in wording someone has seen in their own inbox.
  const autoOn = b.autoChaseOn ?? s.autoChaseOn;
  if (autoOn && !isTested({ testedHashes: s.testedHashes }, emails.chase)) {
    return Response.json({ error: "Send the reminder to yourself first, then switch automatic emails on." }, { status: 409 });
  }
  if (autoOn && !s.agreementKey) return Response.json({ error: "Upload the agreement before switching automatic emails on." }, { status: 409 });
  await prisma.outreachSprint.update({
    where: { id: s.id },
    data: {
      ...(b.pitch !== undefined ? { pitch: b.pitch || null } : {}),
      ...(b.checklist !== undefined ? { checklist: b.checklist || null } : {}),
      ...(b.emails ? { emails } : {}),
      autoChaseOn: autoOn,
    },
  });
  return Response.json({ ok: true, autoChaseOn: autoOn });
});
