import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCTS, advances, isProduct } from "@/lib/hospital-sales";

// The tracked link in every hospital sales email. Records the first click,
// moves the hospital to ENGAGED for that product, and lands on the product
// page carrying the token so an enquiry can be tied back to the send.
//
// Mail security scanners follow links too, so a click here is a signal, not
// proof a person read the email. The enquiry is the event that counts.

export async function GET(req: NextRequest, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const base = new URL("/", req.url);
  const send = /^[A-Za-z0-9_-]{16,40}$/.test(token)
    ? await prisma.salesCampaignSend
        .findUnique({
          where: { token },
          select: { id: true, clickedAt: true, hospitalId: true, campaign: { select: { product: true } } },
        })
        .catch((err) => {
          console.error("[go] lookup failed", err);
          return null;
        })
    : null;
  if (!send || !isProduct(send.campaign.product)) return NextResponse.redirect(new URL("/services", base));

  const product = send.campaign.product;
  if (!send.clickedAt) {
    try {
      await prisma.salesCampaignSend.update({ where: { id: send.id }, data: { clickedAt: new Date() } });
      const st = await prisma.hospitalProductStage.findUnique({
        where: { hospitalId_product: { hospitalId: send.hospitalId, product } },
        select: { stage: true },
      });
      if (!st || advances(st.stage, "ENGAGED")) {
        await prisma.hospitalProductStage.upsert({
          where: { hospitalId_product: { hospitalId: send.hospitalId, product } },
          create: { hospitalId: send.hospitalId, product, stage: "ENGAGED" },
          update: { stage: "ENGAGED", stageAt: new Date() },
        });
      }
    } catch (err) {
      console.error("[go] click record failed", err);
    }
  }
  const dest = new URL(PRODUCTS[product].path, base);
  dest.searchParams.set("ref", token);
  return NextResponse.redirect(dest);
}
