import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  CONTACT_KINDS,
  STAGE_LABELS,
  currentWeek,
  dayLabel,
  isClosed,
  isSigned,
  lagosDayStart,
  programmeAccess,
  returnLink,
  whatsappNumber,
} from "@/lib/signings";
import Desk, { type DeskRow, type CheckIn } from "./Desk";

export const dynamic = "force-dynamic";

const DAY = 24 * 60 * 60 * 1000;
const fmt = (d: Date | null) => (d ? dayLabel(d) : null);

/**
 * The signing desk. One programme, every provider on it, and the three numbers
 * the team lives by: signed against the target, SLAs out, and what is due
 * today. The default view is "due today", because a sprint like this is lost
 * on the follow-ups nobody made, not on the hospitals nobody found.
 */
export default async function SigningDeskPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ q?: string }> }) {
  const session = await auth();
  if (!session) redirect("/login");
  const { id } = await params;
  const { q } = await searchParams;
  const access = await programmeAccess(id, session.user);
  if (!access) notFound();
  const p = access.programme;

  const [providers, engagement] = await Promise.all([
    prisma.providerSigning.findMany({
      where: { programmeId: id },
      include: {
        owner: { select: { id: true, name: true } },
        events: { orderBy: { createdAt: "desc" }, take: 12, include: { actor: { select: { name: true } } } },
      },
      orderBy: [{ nextActionAt: "asc" }, { facility: "asc" }],
    }),
    prisma.engagement.findUniqueOrThrow({
      where: { id: p.engagementId },
      select: {
        name: true,
        engagementManager: { select: { id: true, name: true } },
        assignments: { where: { status: "ACTIVE" }, select: { consultant: { select: { id: true, name: true } } } },
      },
    }),
  ]);

  const team = [
    ...(engagement.engagementManager ? [engagement.engagementManager] : []),
    ...engagement.assignments.map((a) => a.consultant),
  ].filter((u, i, all) => all.findIndex((x) => x.id === u.id) === i);

  const now = new Date();
  const today = lagosDayStart(now);
  const tomorrow = new Date(today.getTime() + DAY);
  const dayAfter = new Date(today.getTime() + 2 * DAY);
  const week = currentWeek(p, now);

  const signedRows = providers.filter((x) => isSigned(x.stage));
  const signedThisWeek = week ? signedRows.filter((x) => x.signedAt && x.signedAt >= week.startAt && x.signedAt < week.endAt).length : null;
  const slaOut = providers.filter((x) => x.stage === "SLA_SENT").length;
  const overdue = providers.filter((x) => !isClosed(x.stage) && x.nextActionAt && x.nextActionAt < today).length;
  const dueToday = providers.filter((x) => !isClosed(x.stage) && x.nextActionAt && x.nextActionAt < tomorrow).length;

  // Today's numbers per person, for the 5pm check-in and the 6pm roll-up.
  const todaysEvents = await prisma.providerSigningEvent.findMany({
    where: { signing: { programmeId: id }, createdAt: { gte: today } },
    select: { kind: true, stage: true, actorId: true, signingId: true },
  });
  const checkIn = (userId: string): CheckIn => {
    const mine = todaysEvents.filter((e) => e.actorId === userId);
    const contacts = mine.filter((e) => (CONTACT_KINDS as readonly string[]).includes(e.kind) || e.kind === "BULK_EMAIL");
    const owned = providers.filter((x) => x.ownerId === userId);
    const signedToday = owned.filter((x) => x.signedAt && x.signedAt >= today);
    return {
      userId,
      name: team.find((u) => u.id === userId)?.name ?? "",
      contacts: contacts.length,
      calls: contacts.filter((e) => e.kind === "CALL").length,
      emails: contacts.filter((e) => e.kind === "EMAIL" || e.kind === "BULK_EMAIL").length,
      whatsapps: contacts.filter((e) => e.kind === "WHATSAPP").length,
      visits: contacts.filter((e) => e.kind === "VISIT").length,
      slasSent: mine.filter((e) => e.kind === "STAGE" && e.stage === "SLA_SENT").length,
      signedToday: signedToday.map((x) => x.facility),
      slaOut: owned.filter((x) => x.stage === "SLA_SENT").length,
      dueTomorrow: owned.filter((x) => !isClosed(x.stage) && x.nextActionAt && x.nextActionAt >= tomorrow && x.nextActionAt < dayAfter).length,
      overdue: owned.filter((x) => !isClosed(x.stage) && x.nextActionAt && x.nextActionAt < today).length,
    };
  };

  const rows: DeskRow[] = providers.map((x) => ({
    id: x.id,
    facility: x.facility,
    groupName: x.groupName,
    facilityType: x.facilityType,
    lga: x.lga,
    area: x.area,
    contactName: x.contactName,
    contactRole: x.contactRole,
    phone: x.phone,
    email: x.email,
    signatoryName: x.signatoryName,
    signatoryPhone: x.signatoryPhone,
    signatoryEmail: x.signatoryEmail,
    source: x.source,
    ownerId: x.ownerId,
    ownerName: x.owner?.name ?? null,
    stage: x.stage,
    slaSentLabel: fmt(x.slaSentAt),
    daysOut: x.slaSentAt && x.stage === "SLA_SENT" ? Math.floor((now.getTime() - x.slaSentAt.getTime()) / DAY) : null,
    signedLabel: fmt(x.signedAt),
    nextAction: x.nextAction,
    nextActionAt: x.nextActionAt?.toISOString() ?? null,
    nextActionLabel: fmt(x.nextActionAt),
    due: !isClosed(x.stage) && !!x.nextActionAt && x.nextActionAt < tomorrow,
    overdue: !isClosed(x.stage) && !!x.nextActionAt && x.nextActionAt < today,
    objection: x.objection,
    notes: x.notes,
    chaseCount: x.chaseCount,
    chasePaused: x.chasePaused,
    lastContactLabel: fmt(x.lastContactAt),
    returnLink: returnLink(x.returnToken),
    whatsapp: whatsappNumber(x.signatoryPhone || x.phone),
    hasSignedFile: !!x.signedFileKey,
    documents: x.documentKeys.length,
    events: x.events.map((e) => ({
      id: e.id,
      kind: e.kind,
      note: e.note,
      stageLabel: e.stage ? STAGE_LABELS[e.stage] : null,
      actor: e.actor?.name ?? (e.kind === "AUTO_CHASE" || e.kind === "UPLOAD" ? "System" : null),
      at: e.createdAt.toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Africa/Lagos" }),
    })),
  }));

  return (
    <Desk
      programme={{
        id: p.id,
        name: p.name,
        engagementName: engagement.name,
        baselineSigned: p.baselineSigned,
        target: p.target,
        deadlineLabel: fmt(p.deadline),
        senderName: p.senderName,
        chaseEnabled: p.chaseEnabled,
        chaseDays: p.chaseDays,
        chaseSubject: p.chaseSubject,
        chaseBody: p.chaseBody,
        documentsChecklist: p.documentsChecklist,
        slaFileName: p.slaFileName,
      }}
      canLead={access.canLead}
      me={{ id: session.user.id, name: session.user.name ?? "" }}
      team={team}
      rows={rows}
      summary={{
        signedInProgramme: signedRows.length,
        total: p.baselineSigned + signedRows.length,
        slaOut,
        dueToday,
        overdue,
        week: week ? { label: `Week ${week.index}`, target: week.target, signed: signedThisWeek ?? 0 } : null,
        todayLabel: dayLabel(now),
      }}
      checkIns={team.map((u) => checkIn(u.id))}
      initialQuery={q ?? ""}
    />
  );
}
