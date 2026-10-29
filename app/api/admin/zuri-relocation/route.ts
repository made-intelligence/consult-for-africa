import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { sendRelocationAll, sendRelocationTest } from "@/lib/cadreHealth/zuriRelocationSend";

export const maxDuration = 120;

const ALLOWED_ROLES = ["DIRECTOR", "PARTNER", "ADMIN"];

/** POST { action: "test" } mails the signed-in user one copy; { action: "send" } mails everyone still waiting. */
export async function POST(req: Request) {
  const session = await auth();
  if (!session || !ALLOWED_ROLES.includes(session.user.role)) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  const { action } = (await req.json().catch(() => ({}))) as { action?: string };

  if (action === "test") {
    if (!session.user.email) return NextResponse.json({ error: "No email on your account" }, { status: 400 });
    return NextResponse.json(await sendRelocationTest(session.user.email));
  }
  if (action === "send") return NextResponse.json(await sendRelocationAll());
  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
