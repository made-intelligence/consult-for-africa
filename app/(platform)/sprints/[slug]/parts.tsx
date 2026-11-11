import Link from "next/link";
import { fmtDay, stageLabel } from "@/lib/outreach";

/** Progress against the sprint's number, and the tabs. Same on every page. */
export function SprintHeader({
  slug,
  tab,
  total,
  target,
  week,
  signedThisWeek,
  endsAt,
  briefUrl,
}: {
  slug: string;
  tab: "queue" | "board" | "providers";
  total: number;
  target: number;
  week: { label: string; target: number } | null;
  signedThisWeek: number | null;
  endsAt: Date;
  briefUrl: string | null;
}) {
  const pct = Math.min(100, Math.round((total / Math.max(1, target)) * 100));
  const tabs = [
    { key: "queue", label: "My queue", href: `/sprints/${slug}` },
    { key: "board", label: "Board", href: `/sprints/${slug}/board` },
    { key: "providers", label: "All providers", href: `/sprints/${slug}/providers` },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-3xl font-semibold text-[#0B3C5D]">
              {total} <span className="text-base font-normal text-slate-500">of {target} signed</span>
            </p>
            <p className="text-sm text-slate-500">
              {week ? `${week.label}: ${signedThisWeek} of ${week.target}. ` : ""}Closes {fmtDay(endsAt)}.
            </p>
          </div>
          {briefUrl && (
            <a href={briefUrl} target="_blank" className="text-sm font-medium text-[#0B3C5D] underline">
              The brief
            </a>
          )}
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
          <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${pct}%` }} />
        </div>
      </div>
      <nav className="flex gap-1 border-b border-slate-200">
        {tabs.map((t) => (
          <Link key={t.key} href={t.href} className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${tab === t.key ? "border-[#0B3C5D] text-[#0B3C5D]" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {t.label}
          </Link>
        ))}
      </nav>
    </div>
  );
}

const STAGE_TONE: Record<string, string> = {
  TARGET: "bg-slate-100 text-slate-600",
  CONTACTED: "bg-sky-50 text-sky-700",
  INTERESTED: "bg-amber-50 text-amber-800",
  SENT: "bg-violet-50 text-violet-700",
  SIGNED: "bg-emerald-50 text-emerald-700",
  DOCS: "bg-emerald-100 text-emerald-800",
  HANDED_OVER: "bg-emerald-600 text-white",
  PARKED: "bg-slate-200 text-slate-600",
  DECLINED: "bg-rose-50 text-rose-700",
  ALREADY_SIGNED: "bg-slate-200 text-slate-600",
};

export function StagePill({ stage, client }: { stage: string; client: string | null }) {
  return <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STAGE_TONE[stage] ?? "bg-slate-100 text-slate-600"}`}>{stageLabel(stage, client)}</span>;
}

/** "Overdue 2 days", "Today", "Thu 14 Nov". */
export function DueLabel({ at, dayStart, dayEnd }: { at: Date | null; dayStart: Date; dayEnd: Date }) {
  if (!at) return <span className="text-xs text-slate-400">Not started</span>;
  if (at < dayStart) {
    const days = Math.max(1, Math.round((dayStart.getTime() - at.getTime()) / 86_400_000));
    return <span className="text-xs font-semibold text-rose-700">Overdue {days} day{days === 1 ? "" : "s"}</span>;
  }
  if (at <= dayEnd) return <span className="text-xs font-semibold text-amber-700">Today</span>;
  return <span className="text-xs text-slate-500">{fmtDay(at)}</span>;
}

export const card = "rounded-xl border border-slate-200 bg-white p-4";
export const h2 = "mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500";
