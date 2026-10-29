// Small shared pieces for the Market Watch admin pages.

export const SOURCE_META: Record<string, { label: string; tag: string; bg: string }> = {
  GOOGLE_REVIEW: { label: "Google review", tag: "G", bg: "#4285F4" },
  INSTAGRAM: { label: "Instagram", tag: "IG", bg: "#C13584" },
  TIKTOK: { label: "TikTok", tag: "TT", bg: "#111111" },
  X: { label: "X", tag: "X", bg: "#000000" },
  NEWS: { label: "News", tag: "N", bg: "#64748B" },
  NAIRALAND: { label: "Nairaland", tag: "NL", bg: "#15803D" },
  WEB: { label: "Web", tag: "AW", bg: "#7C3AED" },
  FACEBOOK: { label: "Facebook", tag: "FB", bg: "#1877F2" },
  YOUTUBE: { label: "YouTube", tag: "YT", bg: "#DC2626" },
  REDDIT: { label: "Reddit", tag: "R", bg: "#FF4500" },
  WEBSITE_CHANGE: { label: "Website change", tag: "WS", bg: "#0F2744" },
  SEARCH_INTEREST: { label: "Search interest", tag: "GT", bg: "#B8962E" },
};

export function SourceTag({ source }: { source: string }) {
  const m = SOURCE_META[source] ?? { tag: "?", bg: "#9CA3AF" };
  return (
    <span className="inline-flex items-center justify-center rounded-lg text-[11px] font-bold text-white shrink-0" style={{ width: 30, height: 30, background: m.bg }}>
      {m.tag}
    </span>
  );
}

const PILL = {
  red: { bg: "#FEE2E2", fg: "#991B1B" },
  amber: { bg: "#FEF3C7", fg: "#92400E" },
  green: { bg: "#DCFCE7", fg: "#166534" },
  blue: { bg: "#E0F2FE", fg: "#075985" },
  grey: { bg: "#F1F5F9", fg: "#475569" },
} as const;

export function Pill({ children, tone = "grey" }: { children: React.ReactNode; tone?: keyof typeof PILL }) {
  const c = PILL[tone];
  return (
    <span className="inline-block rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: c.bg, color: c.fg }}>
      {children}
    </span>
  );
}

export const SENTIMENT_TONE = { POSITIVE: "green", NEGATIVE: "red", MIXED: "amber", NEUTRAL: "grey" } as const;

export function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl ${className}`} style={{ border: "1px solid #e5eaf0" }}>
      {children}
    </div>
  );
}

export function ago(d: Date): string {
  const h = (Date.now() - d.getTime()) / 3_600_000;
  if (h < 1) return `${Math.max(1, Math.round(h * 60))}m ago`;
  if (h < 48) return `${Math.round(h)}h ago`;
  return `${Math.round(h / 24)}d ago`;
}

export function compact(n: number | null | undefined): string | null {
  if (n == null) return null;
  return n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}m` : n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n);
}

/** A moment some days back, for "last 7 days" queries in server components. */
export function daysAgo(days: number): Date {
  return new Date(Date.now() - days * 86_400_000);
}
