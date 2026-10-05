import { NextRequest, NextResponse } from "next/server";
import { createHash } from "node:crypto";
import { z } from "zod";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { isRateLimited } from "@/lib/rate-limit";
import { notifyInternal } from "@/lib/email";
import {
  BASED,
  CONCERNS,
  CONSENT_TEXT,
  CONTACT_BY,
  DRBOLA_LIVE,
  FOR_WHOM,
  HEARD,
  REFERRAL_CONSENT_TEXT,
  REFERRAL_STATUSES,
  SURVEY_IDS,
  UPLOAD_ENGAGEMENT,
  UPLOAD_KEY_PREFIX,
  URGENCY,
  newReference,
} from "@/lib/drbola";

// Everything Dr Bola Akinola's site collects lands here: consultation requests,
// free second opinion requests with imaging, referrals from doctors, and, while
// the site is in preview, his own feedback on each page.
//
// Rows go into the generic AuditSurveyResponse table rather than a new model,
// so the preview needs no migration. The payload carries a reference and a
// status, which is all the referral tracker needs. If the site goes live and
// volume justifies it, a dedicated model is a straightforward move.
//
// While in preview nothing is sent to Dr Bola or to the person who submitted.
// Everything is marked as a test and comes to CFA, because he is the one
// testing it.

const NOTIFY_TO = "debo.odulana@consultforafrica.com";
const ADMIN_URL = "https://www.consultforafrica.com/admin/drbola";
const ADMIN_ROLES = ["PARTNER", "ADMIN", "ASSOCIATE_DIRECTOR", "DIRECTOR"];

const file = z.object({
  storageKey: z.string().startsWith(UPLOAD_KEY_PREFIX).max(400),
  filename: z.string().min(1).max(260),
  contentType: z.string().min(1).max(160),
  fileSize: z.number().int().positive(),
});

const contact = {
  fullName: z.string().trim().min(2, "Please give your name").max(120),
  phone: z.string().trim().min(7, "We need a number we can reach").max(40),
  email: z.string().trim().toLowerCase().email("That email does not look right").max(200),
};

const patient = z.object({
  kind: z.enum(["consultation", "secondOpinion"]),
  ...contact,
  forWhom: z.enum(FOR_WHOM),
  based: z.enum(BASED),
  concern: z.enum(CONCERNS),
  message: z.string().trim().max(3000).optional().nullable(),
  contactBy: z.enum(CONTACT_BY),
  heard: z.enum(HEARD).optional().nullable(),
  files: z.array(file).max(10).default([]),
  consent: z.literal(true, { message: "We need your agreement to hold your details" }),
});

const referral = z.object({
  kind: z.literal("referral"),
  ...contact,
  specialty: z.string().trim().min(2, "Please give your specialty").max(120),
  hospital: z.string().trim().min(2, "Please give your hospital or clinic").max(160),
  mdcn: z.string().trim().max(40).optional().nullable(),
  patientRef: z.string().trim().min(1, "Initials or a hospital number").max(60),
  patientAge: z.string().trim().max(10).optional().nullable(),
  patientSex: z.enum(["Female", "Male", "Prefer not to say"]).optional().nullable(),
  urgency: z.enum(URGENCY),
  diagnosis: z.string().trim().min(3, "A working diagnosis, however rough").max(300),
  summary: z.string().trim().max(4000).optional().nullable(),
  files: z.array(file).max(10).default([]),
  consent: z.literal(true, { message: "Please confirm the patient has agreed" }),
});

const feedback = z.object({
  kind: z.literal("feedback"),
  page: z.string().max(200),
  comment: z.string().trim().min(2, "Write a note first").max(4000),
  name: z.string().trim().max(120).optional().nullable(),
});

const body = z.discriminatedUnion("kind", [patient, referral, feedback]);

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

function clientIp(req: NextRequest) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "drbola", { windowMs: 60 * 60 * 1000, max: 20 })) {
    return NextResponse.json({ error: "Too many submissions from here. Please try again later." }, { status: 429 });
  }

  const raw = await req.json().catch(() => null);
  // Honeypot: parsed and silently accepted so a bot learns nothing.
  if (raw && typeof raw === "object" && "company" in raw && (raw as { company?: string }).company) {
    return NextResponse.json({ ok: true, reference: newReference() });
  }

  const parsed = body.safeParse(raw);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Please check the form." }, { status: 400 });
  }
  const d = parsed.data;
  const survey =
    d.kind === "feedback" ? SURVEY_IDS.feedback : d.kind === "referral" ? SURVEY_IDS.referral : SURVEY_IDS[d.kind];
  const reference = d.kind === "feedback" ? null : newReference();

  const { files, ...rest } = "files" in d ? d : { ...d, files: [] as z.infer<typeof file>[] };
  const payload = {
    ...rest,
    reference,
    status: d.kind === "referral" ? "Received" : d.kind === "feedback" ? null : "New",
    statusHistory: [] as { status: string; at: string }[],
    preview: !DRBOLA_LIVE,
    consentText: d.kind === "referral" ? REFERRAL_CONSENT_TEXT : d.kind === "feedback" ? null : CONSENT_TEXT,
    consentedAt: d.kind === "feedback" ? null : new Date().toISOString(),
    ipHash: createHash("sha256").update(ip).digest("hex").slice(0, 32),
    fileCount: files.length,
  };

  await prisma.auditSurveyResponse.create({
    data: {
      survey,
      engagementId: "osteon",
      payload,
      userAgent: req.headers.get("user-agent")?.slice(0, 300) ?? null,
    },
  });

  if (files.length && reference) {
    await prisma.auditUpload.createMany({
      data: files.map((f) => ({
        engagement: UPLOAD_ENGAGEMENT,
        section: reference,
        filename: f.filename,
        storageKey: f.storageKey,
        contentType: f.contentType,
        sizeBytes: f.fileSize,
        uploadedBy: d.kind === "feedback" ? null : d.fullName,
      })),
      skipDuplicates: true,
    });
  }

  // Never fail the person over a notification.
  try {
    const label =
      d.kind === "feedback"
        ? `Dr Bola feedback on ${d.page}`
        : d.kind === "referral"
          ? `Referral ${reference} from ${d.fullName} (${d.urgency})`
          : `${d.kind === "secondOpinion" ? "Second opinion" : "Consultation"} ${reference}: ${d.fullName}, ${d.based}`;
    const detail =
      d.kind === "feedback"
        ? `<p><b>${esc(d.name || "Someone")}</b> on <b>${esc(d.page)}</b>:</p><blockquote style="border-left:3px solid #A9864A;margin:0;padding:4px 12px;color:#334155">${esc(d.comment).replace(/\n/g, "<br>")}</blockquote>`
        : d.kind === "referral"
          ? `<p><b>${esc(d.fullName)}</b>, ${esc(d.specialty)}, ${esc(d.hospital)}<br>Patient ${esc(d.patientRef)}: ${esc(d.diagnosis)}<br>${files.length} file(s) attached.</p>`
          : `<p><b>${esc(d.fullName)}</b> (${esc(d.forWhom)}, ${esc(d.based)})<br>${esc(d.concern)}<br>Prefers ${esc(d.contactBy)}. ${files.length} file(s) attached.</p>`;
    await notifyInternal(
      NOTIFY_TO,
      `${DRBOLA_LIVE ? "" : "[Preview] "}${label}`,
      `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1F2937">${detail}<p><a href="${ADMIN_URL}" style="color:#14233A">Open the queue</a></p></div>`,
    );
  } catch (err) {
    console.error("[drbola] notification failed", err);
  }

  return NextResponse.json({ ok: true, reference });
}

/**
 * GET ?ref=BA-XXXXXX&email=...: the referring doctor's tracker. Both must match,
 * and the answer is the status and dates only, never clinical content.
 */
export async function GET(req: NextRequest) {
  const ip = clientIp(req);
  if (isRateLimited(ip, "drbola-track", { windowMs: 10 * 60 * 1000, max: 20 })) {
    return NextResponse.json({ error: "Too many lookups. Try again shortly." }, { status: 429 });
  }
  const ref = req.nextUrl.searchParams.get("ref")?.trim().toUpperCase() ?? "";
  const email = req.nextUrl.searchParams.get("email")?.trim().toLowerCase() ?? "";
  if (!/^BA-[A-Z0-9]{6}$/.test(ref) || !email) {
    return NextResponse.json({ error: "Enter the reference and the email you referred with." }, { status: 400 });
  }

  const row = await prisma.auditSurveyResponse.findFirst({
    where: {
      survey: SURVEY_IDS.referral,
      AND: [
        { payload: { path: ["reference"], equals: ref } },
        { payload: { path: ["email"], equals: email } },
      ],
    },
    select: { payload: true, createdAt: true },
  });
  if (!row) return NextResponse.json({ error: "No referral matches that reference and email." }, { status: 404 });

  const p = row.payload as { status?: string; statusHistory?: { status: string; at: string }[]; patientRef?: string };
  return NextResponse.json({
    reference: ref,
    patientRef: p.patientRef ?? null,
    status: p.status ?? "Received",
    receivedAt: row.createdAt,
    history: p.statusHistory ?? [],
    steps: REFERRAL_STATUSES,
  });
}

/** PATCH: move a referral or enquiry along. Platform staff only. */
export async function PATCH(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !ADMIN_ROLES.includes(session.user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const parsed = z
    .object({ id: z.string().min(1), status: z.string().min(2).max(40) })
    .safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const row = await prisma.auditSurveyResponse.findUnique({ where: { id: parsed.data.id } });
  if (!row || !row.survey.startsWith("drbola-")) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const p = row.payload as Record<string, unknown> & { statusHistory?: { status: string; at: string; by?: string }[] };
  const history = [
    ...(p.statusHistory ?? []),
    { status: parsed.data.status, at: new Date().toISOString(), by: session.user.name ?? undefined },
  ];
  await prisma.auditSurveyResponse.update({
    where: { id: row.id },
    data: { payload: { ...p, status: parsed.data.status, statusHistory: history } },
  });
  return NextResponse.json({ ok: true });
}
