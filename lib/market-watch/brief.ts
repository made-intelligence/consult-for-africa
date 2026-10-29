import { emailWatchBrief } from "@/lib/email";
import type { Block, DashboardData } from "@/lib/client-dashboard/types";

/** The weekly brief email, read off the composed dashboard so the two always agree. */
export async function sendBrief(
  w: { id: string; name: string; alertEmails: string[] },
  dashboardId: string | null,
  data: DashboardData,
) {
  const first = data.sections[0];
  const kpiBlock = first?.blocks.find((b): b is Extract<Block, { kind: "kpis" }> => b.kind === "kpis");
  const actionBlock = first?.blocks.find((b): b is Extract<Block, { kind: "findings" }> => b.kind === "findings");
  const unit = (u?: string) => (u === "percent" ? "%" : "");
  for (const to of w.alertEmails) {
    await emailWatchBrief({
      to,
      watchId: w.id,
      watchName: w.name,
      headline: data.headline,
      oneThing: first?.lead,
      kpis: (kpiBlock?.items ?? []).map((k) => ({ label: k.label, value: `${k.value}${typeof k.value === "number" ? unit(k.unit) : ""}`, note: k.note })),
      actions: (actionBlock?.items ?? []).map((a) => ({ headline: a.headline, detail: a.detail })),
      dashboardId,
    });
  }
}
