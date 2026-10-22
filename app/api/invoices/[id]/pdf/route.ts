import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest } from "next/server";
import { handler } from "@/lib/api-handler";
import { invoiceHtmlInclude, renderInvoiceHtml } from "@/lib/invoiceHtml";

type Ctx = { params: Promise<{ id: string }> };

export const GET = handler(async function GET(req: NextRequest, { params }: Ctx) {
  const session = await auth();
  if (!session) return Response.json({ error: "Unauthorized" }, { status: 401 });

  const canView = ["ENGAGEMENT_MANAGER", "ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN", "EXECUTIVE_ASSISTANT"].includes(session.user.role);
  if (!canView) return Response.json({ error: "Forbidden" }, { status: 403 });

  const { id } = await params;

  const invoice = await prisma.invoice.findUnique({
    where: { id },
    include: invoiceHtmlInclude,
  });

  if (!invoice) return Response.json({ error: "Not found" }, { status: 404 });

  // IDOR check for EMs
  const isElevated = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN", "EXECUTIVE_ASSISTANT"].includes(session.user.role);
  if (!isElevated) {
    const withEM = await prisma.invoice.findUnique({
      where: { id },
      select: { engagement: { select: { engagementManagerId: true } } },
    });
    if (!withEM?.engagement || withEM.engagement.engagementManagerId !== session.user.id) {
      return Response.json({ error: "Forbidden" }, { status: 403 });
    }
  }

  const html = renderInvoiceHtml(invoice);

  const safeName = invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, "_");

  return new Response(html, {
    status: 200,
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Disposition": `inline; filename="${safeName}.pdf"`,
    },
  });
});
