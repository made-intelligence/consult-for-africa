// The shape of a client dashboard, shared by every client.
//
// An analysis script (scripts/client-dashboard/) turns a client's own files
// into one of these, it is stored as EngagementDashboard.data, and
// components/client-dashboard/DashboardView.tsx renders it in the client
// portal and in the admin preview. Nothing here is client-specific, so the
// next client needs a new analysis script, not a new page.
//
// Aggregates only. A block never carries a patient, a staff member or any row
// that could identify one, because the portal shows it to every enabled
// contact on the client.

export type Tone = "good" | "watch" | "concern" | "neutral";

export type Unit = "NGN" | "count" | "percent" | "score";

export type Kpi = {
  label: string;
  value: number | string;
  unit?: Unit;
  /** One line under the figure saying what it is measured against. */
  note?: string;
  tone?: Tone;
};

export type Block =
  | { kind: "kpis"; items: Kpi[] }
  | {
      kind: "series";
      title: string;
      unit: Unit;
      note?: string;
      points: { label: string; value: number; note?: string }[];
      /** A dashed line across the bars, e.g. the assumed baseline. */
      reference?: { label: string; value: number };
    }
  | {
      kind: "breakdown";
      title: string;
      unit: Unit;
      note?: string;
      items: { label: string; value: number; note?: string }[];
    }
  | {
      kind: "findings";
      title: string;
      items: { headline: string; detail: string; tone: Tone; source?: string }[];
    }
  | {
      kind: "checks";
      title: string;
      note?: string;
      items: { label: string; status: "ok" | "partial" | "missing"; detail: string }[];
    }
  | {
      kind: "compare";
      title: string;
      note?: string;
      columns: string[];
      rows: { label: string; values: (string | number | null)[]; tone?: Tone }[];
    }
  | { kind: "text"; title?: string; body: string };

export type Section = { title: string; lead?: string; blocks: Block[] };

export type DashboardData = {
  /** The one sentence at the top. */
  headline: string;
  /** What this dashboard covers, e.g. "January to September 2026". */
  period: string;
  sections: Section[];
  /** Every file or instrument the figures came from, so nothing is unsourced. */
  sources: { name: string; detail: string }[];
};
