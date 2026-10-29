import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  NICOTINE_LABELS,
  WEIGHT_TREND_LABELS,
  lyfeHeadcount,
  lyfeInviteLink,
  LYFE_EVENT_ALLOCATION,
  LYFE_INVITERS,
  minutesWaiting,
  waitingLabel,
} from "@/lib/lyfe";
import { slotLabel } from "@/lib/lyfeEmail";
import Queue, { type Row } from "./Queue";

export const dynamic = "force-dynamic";

const ALLOWED_ROLES = ["ASSOCIATE_DIRECTOR", "DIRECTOR", "PARTNER", "ADMIN"];

/**
 * The coordinator's queue.
 *
 * The March campaign produced 170 names and nothing else, and the research
 * says that gap is almost always one of two things: nobody called fast enough,
 * or nobody called more than once. So this page is built around exactly those
 * two numbers and puts everything else behind them.
 *
 * Sorted by how long somebody has been waiting, not by when they arrived.
 */
export default async function LyfeEnquiriesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (!ALLOWED_ROLES.includes(session.user.role)) redirect("/dashboard");

  const entries = await prisma.lyfeEnquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 500,
    include: { owner: { select: { name: true } } },
  });

  const now = new Date();
  const open = entries.filter(
    (e) => !["CONVERTED", "NOT_PROCEEDING", "UNREACHABLE"].includes(e.status),
  );
  const waiting = entries.filter((e) => e.status === "NEW");
  const late = waiting.filter((e) => minutesWaiting(e.createdAt, null) > 60);

  // The headline number. Median rather than mean, because one row that sat
  // over a weekend should not flatter or wreck the picture.
  const answered = entries.filter((e) => e.firstContactedAt);
  const times = answered
    .map((e) => minutesWaiting(e.createdAt, e.firstContactedAt))
    .sort((a, b) => a - b);
  const median = times.length
    ? times.length % 2
      ? times[(times.length - 1) / 2]!
      : Math.round((times[times.length / 2 - 1]! + times[times.length / 2]!) / 2)
    : null;

  const booked = entries.filter((e) =>
    ["BOOKED", "ATTENDED", "CONVERTED"].includes(e.status),
  ).length;
  const bookRate = entries.length ? Math.round((booked / entries.length) * 100) : 0;

  // Never contacted twice. This is the single commonest failure in the
  // research: half of all leads are never called a second time, and 93 per
  // cent of leads that ever convert are reached inside six attempts.
  const oneAttemptOnly = entries.filter(
    (e) => e.contactAttempts === 1 && !["CONVERTED", "BOOKED", "ATTENDED"].includes(e.status),
  ).length;

  const due = open.filter((e) => e.nextActionAt && e.nextActionAt <= now).length;

  // The evening is its own number, because a room that is half full on the
  // Thursday is a different problem from a diary that is half full.
  const rsvps = entries.filter((e) => e.intent === "EVENT_RSVP");
  const count = lyfeHeadcount(rsvps);
  const interested = rsvps.filter((e) => e.eventStage === "INTERESTED").length;
  const waitlist = rsvps.filter((e) => e.eventStage === "WAITLIST").length;
  const clinicians = rsvps.filter((e) => e.isClinician).length;

  // Several people are working the same seventy places, so the only question
  // worth answering afterwards is whose names actually came. The inviter key
  // rides on utmSource, set by the ?i= on the link each of them sends.
  const byInviter = LYFE_INVITERS.map((inv) => {
    const mine = rsvps.filter((e) => e.utmSource === inv.key);
    return {
      key: inv.key,
      name: inv.name,
      bucket: inv.bucket,
      places: inv.places,
      note: inv.note ?? null,
      link: lyfeInviteLink(inv.key),
      applied: mine.length,
      invited: mine.filter((e) => e.eventStage === "INVITED").length,
      confirmed: mine.filter((e) => e.eventStage === "CONFIRMED").length,
      declined: mine.filter((e) => e.eventStage === "DECLINED").length,
      heads: lyfeHeadcount(mine).confirmed,
    };
  });
  // Anybody who arrived without one of our links, so the gap is visible
  // rather than quietly absorbed into a bucket.
  const KEYS = new Set(LYFE_INVITERS.map((i) => i.key));
  const unattributed = rsvps.filter((e) => !e.utmSource || !KEYS.has(e.utmSource));

  const rows: Row[] = [...entries]
    .sort((a, b) => {
      // Untouched first, longest wait at the top. Then everything else by how
      // overdue its next action is.
      const aNew = a.status === "NEW" ? 0 : 1;
      const bNew = b.status === "NEW" ? 0 : 1;
      if (aNew !== bNew) return aNew - bNew;
      if (aNew === 0) return a.createdAt.getTime() - b.createdAt.getTime();
      const aDue = a.nextActionAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      const bDue = b.nextActionAt?.getTime() ?? Number.MAX_SAFE_INTEGER;
      if (aDue !== bDue) return aDue - bDue;
      return b.createdAt.getTime() - a.createdAt.getTime();
    })
    .map((e) => ({
      id: e.id,
      fullName: e.fullName,
      email: e.email,
      phone: e.phone,
      intent: e.intent,
      slotLabel: e.slotAt ? slotLabel(e.slotAt) : null,
      paid: !!e.paidAt,
      guestCount: e.guestCount,
      isClinician: e.isClinician,
      pathway: e.pathway,
      concerns: e.concerns,
      timing: e.timing,
      based: e.based,
      format: e.format,
      goal: e.goal,
      notes: e.notes,
      source: e.source,
      sourceDetail: e.sourceDetail,
      status: e.status,
      eventStage: e.eventStage,
      invitedAtLabel: e.invitedAt
        ? e.invitedAt.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      contactAttempts: e.contactAttempts,
      waitingMinutes: minutesWaiting(e.createdAt, e.firstContactedAt),
      createdAtLabel: e.createdAt.toLocaleString("en-GB", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      nextAction: e.nextAction,
      nextActionAtLabel: e.nextActionAt
        ? e.nextActionAt.toLocaleString("en-GB", {
            day: "numeric",
            month: "short",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null,
      coordinatorNotes: e.coordinatorNotes,
      ownerName: e.owner?.name ?? null,
      screening: [
        e.heightReported && { label: "Height", value: e.heightReported },
        e.weightReported && { label: "Weight", value: e.weightReported },
        e.nicotine && { label: "Nicotine", value: NICOTINE_LABELS[e.nicotine] },
        e.weightTrend && { label: "Weight trend", value: WEIGHT_TREND_LABELS[e.weightTrend] },
        e.priorSurgery !== null && {
          label: "Prior surgery",
          value: e.priorSurgery ? "Yes" : "No",
        },
      ].filter(Boolean) as { label: string; value: string }[],
    }));

  return (
    <div className="mx-auto w-full max-w-6xl px-5 py-10">
      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-amber-700">
        MedLYFE Wellness and Longevity Centre
      </p>
      <h1 className="mt-2 text-3xl font-bold text-slate-900">The enquiry queue</h1>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-slate-600">
        Worked by how long somebody has been waiting, not by when they arrived. Calling at
        five minutes rather than thirty multiplies the odds of qualifying a lead by
        twenty one, and half of all leads are never called a second time. Those two
        sentences are the whole job.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
        <Stat
          label="Waiting for a first call"
          value={String(waiting.length)}
          detail={late.length ? `${late.length} over an hour` : "None late"}
          alarm={late.length > 0}
        />
        <Stat
          label="Median time to first contact"
          value={median === null ? "No data" : waitingLabel(median)}
          detail="Under an hour, every time"
          alarm={median !== null && median > 60}
        />
        <Stat
          label="Called once and abandoned"
          value={String(oneAttemptOnly)}
          detail="Six attempts reaches 93 per cent"
          alarm={oneAttemptOnly > 0}
        />
        <Stat label="Follow-ups due now" value={String(due)} detail="Against the cadence" alarm={due > 0} />
        <Stat
          label="Reached a booking"
          value={`${bookRate}%`}
          detail={`${booked} of ${entries.length}. Benchmark 20 to 35`}
        />
        <Stat
          label="Places held"
          value={`${count.confirmed} of ${count.places}`}
          detail={`${count.invitedAwaiting} invited and silent, ${clinicians} clinicians`}
          alarm={count.confirmed > count.places}
        />
        <Stat
          label="Interested, not yet invited"
          value={String(interested)}
          detail={waitlist ? `${waitlist} on the waiting list` : `${count.remaining} places left`}
        />
      </div>

      <InviterTable rows={byInviter} unattributed={unattributed.length} />

      <div className="mt-10">
        <Queue rows={rows} />
      </div>
    </div>
  );
}

/**
 * Who is bringing whom, with the link each of them sends.
 *
 * The allocation used to be a sentence of static numbers, which told nobody
 * whether Yomi's thirty were coming. This counts the rows against it, and
 * carries the link so a coordinator chasing an inviter can copy it straight
 * out of the page rather than reconstructing it.
 */
function InviterTable({
  rows,
  unattributed,
}: {
  unattributed: number;
  rows: {
    key: string;
    name: string;
    bucket: string;
    places: number;
    note: string | null;
    link: string;
    applied: number;
    invited: number;
    confirmed: number;
    declined: number;
    heads: number;
  }[];
}) {
  const total = rows.reduce(
    (a, r) => ({
      places: a.places + 0,
      applied: a.applied + r.applied,
      confirmed: a.confirmed + r.confirmed,
      heads: a.heads + r.heads,
    }),
    { places: 0, applied: 0, confirmed: 0, heads: 0 },
  );

  return (
    <section className="mt-10">
      <h2 className="text-sm font-bold uppercase tracking-[0.12em] text-gray-500">
        Who is bringing whom
      </h2>
      <p className="mt-2 max-w-3xl text-[13px] leading-relaxed text-gray-500">
        Each person sends their own link. Applying is not a place: the team
        still chooses, and the invitation to confirm goes out afterwards. Only
        confirmed counts against the seventy.
      </p>

      <div className="mt-4 overflow-x-auto rounded-lg border border-gray-200">
        <table className="w-full min-w-[820px] text-left text-[13px]">
          <thead className="bg-gray-50 text-[11px] uppercase tracking-[0.1em] text-gray-500">
            <tr>
              <th className="px-3 py-2.5 font-semibold">Inviter</th>
              <th className="px-3 py-2.5 font-semibold">Drawing against</th>
              <th className="px-3 py-2.5 text-right font-semibold">Places</th>
              <th className="px-3 py-2.5 text-right font-semibold">Applied</th>
              <th className="px-3 py-2.5 text-right font-semibold">Invited</th>
              <th className="px-3 py-2.5 text-right font-semibold">Confirmed</th>
              <th className="px-3 py-2.5 text-right font-semibold">Heads</th>
              <th className="px-3 py-2.5 font-semibold">Their link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {rows.map((r) => (
              <tr key={r.key} className="align-top">
                <td className="px-3 py-2.5">
                  <span className="font-semibold text-gray-900">{r.name}</span>
                  {r.note ? (
                    <span className="mt-0.5 block text-[11.5px] leading-snug text-gray-500">
                      {r.note}
                    </span>
                  ) : null}
                </td>
                <td className="px-3 py-2.5 text-gray-600">{r.bucket}</td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">
                  {r.places}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-900">
                  {r.applied || "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">
                  {r.invited || "—"}
                </td>
                <td className="px-3 py-2.5 text-right font-semibold tabular-nums text-gray-900">
                  {r.confirmed || "—"}
                </td>
                <td className="px-3 py-2.5 text-right tabular-nums text-gray-600">
                  {r.heads || "—"}
                </td>
                <td className="px-3 py-2.5">
                  <code className="select-all break-all text-[11.5px] text-gray-500">
                    {r.link}
                  </code>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-gray-50 text-[12.5px] font-semibold text-gray-700">
            <tr>
              <td className="px-3 py-2.5" colSpan={3}>
                Total
              </td>
              <td className="px-3 py-2.5 text-right tabular-nums">{total.applied}</td>
              <td className="px-3 py-2.5" />
              <td className="px-3 py-2.5 text-right tabular-nums">{total.confirmed}</td>
              <td className="px-3 py-2.5 text-right tabular-nums">{total.heads}</td>
              <td className="px-3 py-2.5" />
            </tr>
          </tfoot>
        </table>
      </div>

      {unattributed > 0 ? (
        <p className="mt-3 text-[12.5px] text-gray-500">
          {unattributed} {unattributed === 1 ? "person" : "people"} arrived
          without one of these links, so nobody is credited with them. Usually
          a forwarded address rather than a forwarded link.
        </p>
      ) : null}
    </section>
  );
}

function Stat({
  label,
  value,
  detail,
  alarm,
}: {
  label: string;
  value: string;
  detail: string;
  alarm?: boolean;
}) {
  return (
    <div
      className="rounded-xl border bg-white p-4"
      style={{ borderColor: alarm ? "#FCA5A5" : "#E2E8F0" }}
    >
      <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{label}</p>
      <p
        className="mt-2 text-2xl font-bold tabular-nums"
        style={{ color: alarm ? "#B42318" : "#0F172A" }}
      >
        {value}
      </p>
      <p className="mt-1 text-[11px] leading-snug text-slate-500">{detail}</p>
    </div>
  );
}
