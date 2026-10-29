/**
 * Put the Arabella interim diagnostic report in Dr Chito's client portal, so
 * the first thing she sees on signing in is the work (27 Oct 2026).
 *
 * Uploads docs/arabella/arabella-diagnostic-report-cfa.pdf to R2 under an
 * unguessable key (the bucket is publicly readable, so the key is the only
 * control), then delivers the engagement's existing "Diagnostic audit report"
 * deliverable to the client. Also delivers "Survey instruments", which have
 * been live on /ArabellaProject since 30 Sep.
 *
 *   python3 scripts/build-arabella-audit-docs.py
 *   npx tsx --env-file=.env.local scripts/publish-arabella-interim-report.ts
 */
import { readFileSync } from "fs";
import { randomBytes } from "crypto";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { PrismaClient } from "@prisma/client";
import { r2Client, getPublicUrl, objectExists } from "@/lib/r2";

const prisma = new PrismaClient();
const PDF = "docs/arabella/arabella-diagnostic-report-cfa.pdf";
const REPORT_ID = "cmurdqys20019w4ox48zisdoh";
const SURVEYS_ID = "cmurdqlwe000zw4oxxcj0lj8e";

async function main() {
  const key = `deliverables/arabella/${randomBytes(16).toString("hex")}-arabella-interim-report.pdf`;
  await r2Client.send(
    new PutObjectCommand({
      Bucket: process.env.R2_BUCKET_NAME ?? "cfa-uploads",
      Key: key,
      Body: readFileSync(PDF),
      ContentType: "application/pdf",
      ContentDisposition: 'inline; filename="Arabella Diagnostic Audit - Interim Report.pdf"',
    })
  );
  if (!(await objectExists(key))) throw new Error(`Upload did not land: ${key}`);
  const fileUrl = await getPublicUrl(key);

  const now = new Date();
  await prisma.deliverable.update({
    where: { id: REPORT_ID },
    data: {
      name: "Diagnostic audit report (interim)",
      description:
        "What needs immediate attention, what to strengthen before expanding, and what can wait, from the evidence received to 21 October 2026. Section 7 lists the information still outstanding and what each item would change.",
      fileUrl,
      status: "DELIVERED_TO_CLIENT",
      clientVisible: true,
      submittedAt: now,
      approvedAt: now,
    },
  });
  await prisma.deliverable.update({
    where: { id: SURVEYS_ID },
    data: {
      description: "Staff, leadership, patient and referrer surveys, live on your project page.",
      fileUrl: "https://www.consultforafrica.com/ArabellaProject",
      status: "DELIVERED_TO_CLIENT",
      clientVisible: true,
      submittedAt: now,
      approvedAt: now,
    },
  });
  console.log(`  Report: ${fileUrl}`);
}

main()
  .catch((e) => {
    console.error(String(e));
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
