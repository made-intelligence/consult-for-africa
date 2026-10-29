import { prisma } from "@/lib/prisma";
import { sendViaZeptoMail } from "@/lib/zeptomail";
import { advances, newToken, renderEmail } from "@/lib/hospital-sales";

/**
 * Queue and send hospital sales campaigns.
 *
 * ZeptoMail only. If ZEPTOMAIL_API_KEY is missing this refuses rather than
 * falling back to Zoho SMTP, which throttles batches and flags the domain.
 * The sender of record is SMTP_FROM (hello@), so replies land where Debo reads.
 */

const FROM = process.env.SMTP_FROM ?? "Consult for Africa <hello@consultforafrica.com>";
const REPLY_TO = process.env.REPLY_TO_EMAIL ?? "hello@consultforafrica.com";
const GAP_MS = 400;

function parse(addr: string) {
  const m = addr.match(/^\s*([^<]+?)\s*<([^>]+)>\s*$/);
  return m ? { name: m[1].trim(), email: m[2].trim() } : { email: addr.trim() };
}

/** Stages that should never get another cold email for this product. */
const DO_NOT_EMAIL = ["ENQUIRED", "SAMPLE", "PROPOSAL", "WON", "LOST", "NOT_FIT"];

async function suppressedSet(emails: string[]): Promise<Set<string>> {
  if (!emails.length) return new Set();
  const rows = await prisma.communicationSuppression.findMany({
    where: { email: { in: emails }, OR: [{ channel: "EMAIL" }, { channel: null }] },
    select: { email: true },
  });
  return new Set(rows.map((r) => r.email!.toLowerCase()));
}

/**
 * Create a QUEUED send for every emailable contact of the chosen hospitals.
 * Skips suppressed addresses, hospitals already past the cold stages for this
 * product, and contacts this campaign already has.
 */
export async function queueCampaign(campaignId: string, filter: { categories?: string[]; lgas?: string[] }) {
  const campaign = await prisma.salesCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  const contacts = await prisma.hospitalContact.findMany({
    where: {
      email: { not: null },
      hospital: {
        ...(filter.categories?.length ? { category: { in: filter.categories } } : {}),
        ...(filter.lgas?.length ? { lga: { in: filter.lgas } } : {}),
        // `none` keeps hospitals that have no stage row for this product yet.
        productStages: { none: { product: campaign.product, stage: { in: DO_NOT_EMAIL } } },
      },
      sends: { none: { campaignId } },
    },
    select: { id: true, email: true, hospitalId: true },
  });
  const suppressed = await suppressedSet(contacts.map((c) => c.email!.toLowerCase()));
  const rows = contacts
    .filter((c) => !suppressed.has(c.email!.toLowerCase()))
    .map((c) => ({ campaignId, contactId: c.id, hospitalId: c.hospitalId, email: c.email!.toLowerCase(), token: newToken() }));
  const created = await prisma.salesCampaignSend.createMany({ data: rows, skipDuplicates: true });
  return { matched: contacts.length, suppressed: contacts.length - rows.length, queued: created.count };
}

export async function sentToday(campaignId: string): Promise<number> {
  const start = new Date();
  start.setUTCHours(0, 0, 0, 0);
  return prisma.salesCampaignSend.count({ where: { campaignId, status: "SENT", sentAt: { gte: start } } });
}

/**
 * Send the next slice of QUEUED rows, never past the campaign's daily cap.
 * Re-checks suppression at send time, because a bounce webhook may have landed
 * since the row was queued.
 */
export async function sendBatch(campaignId: string, max: number) {
  if (!process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set. Hospital sales email will not fall back to SMTP.");
  const campaign = await prisma.salesCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  if (campaign.status !== "SENDING") throw new Error(`Campaign is ${campaign.status}, not SENDING`);
  const room = Math.max(0, campaign.dailyCap - (await sentToday(campaignId)));
  const take = Math.min(max, room);
  const result = { attempted: 0, sent: 0, failed: 0, suppressed: 0, capReached: room === 0 };
  if (!take) return result;

  const queue = await prisma.salesCampaignSend.findMany({
    where: { campaignId, status: "QUEUED" },
    orderBy: { createdAt: "asc" },
    take,
    select: { id: true, email: true, token: true, hospitalId: true, hospital: { select: { name: true } }, contact: { select: { name: true } } },
  });
  const suppressed = await suppressedSet(queue.map((q) => q.email));

  for (const q of queue) {
    result.attempted++;
    if (suppressed.has(q.email)) {
      await prisma.salesCampaignSend.update({ where: { id: q.id }, data: { status: "SUPPRESSED" } });
      result.suppressed++;
      continue;
    }
    const { html, text } = renderEmail({ body: campaign.body, ctaText: campaign.ctaText, token: q.token, hospital: q.hospital.name, name: q.contact.name });
    const subject = campaign.subject.replace(/\{\{\s*hospital\s*\}\}/g, q.hospital.name);
    const res = await sendViaZeptoMail({ from: parse(FROM), to: [{ email: q.email }], replyTo: parse(REPLY_TO), subject, htmlbody: html, textbody: text });
    if (res.ok) {
      result.sent++;
      await prisma.$transaction(async (tx) => {
        await tx.salesCampaignSend.update({ where: { id: q.id }, data: { status: "SENT", sentAt: new Date(), messageId: res.messageId ?? null } });
        const st = await tx.hospitalProductStage.findUnique({
          where: { hospitalId_product: { hospitalId: q.hospitalId, product: campaign.product } },
          select: { stage: true },
        });
        if (!st || advances(st.stage, "CONTACTED")) {
          await tx.hospitalProductStage.upsert({
            where: { hospitalId_product: { hospitalId: q.hospitalId, product: campaign.product } },
            create: { hospitalId: q.hospitalId, product: campaign.product, stage: "CONTACTED" },
            update: { stage: "CONTACTED", stageAt: new Date() },
          });
        }
      });
    } else {
      result.failed++;
      await prisma.salesCampaignSend.update({ where: { id: q.id }, data: { status: "FAILED", error: res.error ?? "unknown" } });
    }
    await new Promise((r) => setTimeout(r, GAP_MS));
  }

  const left = await prisma.salesCampaignSend.count({ where: { campaignId, status: "QUEUED" } });
  if (!left) await prisma.salesCampaign.update({ where: { id: campaignId }, data: { status: "DONE" } });
  return result;
}

/** A rendered copy to the person pressing the button, with no send row. */
export async function sendTest(campaignId: string, to: string) {
  if (!process.env.ZEPTOMAIL_API_KEY) throw new Error("ZEPTOMAIL_API_KEY is not set");
  const c = await prisma.salesCampaign.findUniqueOrThrow({ where: { id: campaignId } });
  const { html, text } = renderEmail({ body: c.body, ctaText: c.ctaText, token: "test-preview-token-0000", hospital: "Example Hospital", name: null });
  return sendViaZeptoMail({ from: parse(FROM), to: [{ email: to }], replyTo: parse(REPLY_TO), subject: `[TEST] ${c.subject.replace(/\{\{\s*hospital\s*\}\}/g, "Example Hospital")}`, htmlbody: html, textbody: text });
}
