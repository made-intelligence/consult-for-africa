import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { notifyInternal } from "@/lib/email";
import { composeUpdate, havenFounders } from "@/lib/havenFounderUpdate";

/**
 * Friday morning: tell Debo this week's founders' update is drafted.
 *
 * It does not send to the founders. It goes out in his name to the owners, so
 * a person reads it and presses send; this only makes sure the week cannot
 * pass without anyone noticing. Silent if it has already gone.
 */

export const dynamic = "force-dynamic";

const DEBO = "debo.odulana@consultforafrica.com";
const PAGE = "https://www.consultforafrica.com/admin/haven-founders-update";

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const u = await composeUpdate();
  const { clientId } = await havenFounders();
  const gone = await prisma.communication.count({
    where: { clientId, tags: { hasEvery: ["haven-founders-weekly", `week:${u.week}`] }, status: "SENT" },
  });
  if (gone > 0) return NextResponse.json({ ok: true, skipped: "already sent" });

  const esc = (s: string) => s.replace(/[<>&]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" })[c]!);
  await notifyInternal(
    DEBO,
    "Haven founders' update is ready to send",
    `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">
<p>This week's update is drafted from the platform. Add what was done and what is next, then send.</p>
<ul>${u.auto.map((a) => `<li>${esc(a)}</li>`).join("")}</ul>
<p><a href="${PAGE}" style="color:#0B3C5D;font-weight:700">Review and send</a></p>
</div>`
  );
  return NextResponse.json({ ok: true, reminded: true });
}
