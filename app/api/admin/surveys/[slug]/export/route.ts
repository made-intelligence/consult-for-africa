import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { handler } from "@/lib/api-handler";
import { ELEVATED_ROLES } from "@/lib/constants";
import { surveyBySlug } from "@/lib/surveys/registry";
import { loadSurvey, toCsv, toJson } from "@/lib/surveys/archive";

/**
 * GET /api/admin/surveys/[slug]/export?format=csv|json&contact=1
 *
 * Contact details are left out unless asked for, and cannot be asked for on a
 * survey that promised anonymity. The export is the thing most likely to be
 * mailed on or dropped in a shared folder, so the safe version is the default.
 */
export const GET = handler(async (req: NextRequest, ctx: { params: Promise<{ slug: string }> }) => {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!ELEVATED_ROLES.includes(session.user.role as (typeof ELEVATED_ROLES)[number])) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { slug } = await ctx.params;
  const survey = surveyBySlug(slug);
  if (!survey) return NextResponse.json({ error: "Unknown survey" }, { status: 404 });

  const format = req.nextUrl.searchParams.get("format") === "json" ? "json" : "csv";
  const wantsContact = req.nextUrl.searchParams.get("contact") === "1";
  // An anonymous survey has no contact details to give, and asking for them
  // should fail loudly rather than quietly return a column of blanks.
  if (wantsContact && survey.pii === "none") {
    return NextResponse.json(
      { error: "This survey was fielded anonymously. There are no contact details to export." },
      { status: 400 },
    );
  }
  const includeContact = wantsContact && survey.pii !== "none";

  const rows = await loadSurvey(slug);
  const stamp = new Date().toISOString().slice(0, 10);
  const filename = `${slug}-${stamp}${includeContact ? "-with-contacts" : ""}.${format}`;

  const body = format === "json" ? toJson(rows, includeContact) : toCsv(rows, includeContact);

  return new NextResponse(body, {
    headers: {
      "Content-Type":
        format === "json" ? "application/json; charset=utf-8" : "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
});
