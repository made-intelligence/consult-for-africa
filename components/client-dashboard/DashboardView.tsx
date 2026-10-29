import type { Block, DashboardData, Kpi, Tone, Unit } from "@/lib/client-dashboard/types";

// Renders a DashboardData for any client. Server component, no chart library:
// single-series bars in one hue with the value printed on each, a native
// tooltip on hover, and status carried by a word and a mark as well as colour.

const NAVY = "#0F2744";
const BAR = "#1F7A8C";
const LINE = "#e5eaf0";
const MUTED = "#6B7280";

const TONE: Record<Tone, { fg: string; bg: string; mark: string; word: string }> = {
  good: { fg: "#166534", bg: "#DCFCE7", mark: "✓", word: "Working" },
  watch: { fg: "#92400E", bg: "#FEF3C7", mark: "!", word: "Watch" },
  concern: { fg: "#991B1B", bg: "#FEE2E2", mark: "▲", word: "Act on" },
  neutral: { fg: "#334155", bg: "#F1F5F9", mark: "•", word: "Note" },
};

const CHECK = {
  ok: { fg: "#166534", bg: "#DCFCE7", word: "In place" },
  partial: { fg: "#92400E", bg: "#FEF3C7", word: "Partly" },
  missing: { fg: "#991B1B", bg: "#FEE2E2", word: "Missing" },
};

function fmt(value: number | string, unit?: Unit, compact = false): string {
  if (typeof value === "string") return value;
  if (unit === "NGN") {
    if (compact && Math.abs(value) >= 1_000_000) return `₦${(value / 1_000_000).toFixed(1)}m`;
    if (compact && Math.abs(value) >= 1_000) return `₦${Math.round(value / 1_000)}k`;
    return `₦${Math.round(value).toLocaleString("en-NG")}`;
  }
  if (unit === "percent") return `${Math.round(value)}%`;
  if (unit === "score") return value.toFixed(1);
  return Math.round(value).toLocaleString("en-NG");
}

function ToneChip({ tone }: { tone: Tone }) {
  const t = TONE[tone];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap"
      style={{ background: t.bg, color: t.fg }}
    >
      <span aria-hidden>{t.mark}</span>
      {t.word}
    </span>
  );
}

function Kpis({ items }: { items: Kpi[] }) {
  return (
    <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
      {items.map((k) => (
        <div key={k.label} className="bg-white rounded-xl px-4 py-4" style={{ border: `1px solid ${LINE}` }}>
          <div className="flex items-start justify-between gap-2">
            <p className="text-[11px] font-medium uppercase tracking-wider" style={{ color: MUTED }}>
              {k.label}
            </p>
            {k.tone && k.tone !== "neutral" && <ToneChip tone={k.tone} />}
          </div>
          <p className="text-2xl font-bold mt-1" style={{ color: NAVY }}>
            {fmt(k.value, k.unit, true)}
          </p>
          {k.note && <p className="text-xs mt-1 leading-snug" style={{ color: MUTED }}>{k.note}</p>}
        </div>
      ))}
    </div>
  );
}

function Series({ block }: { block: Extract<Block, { kind: "series" }> }) {
  const max = Math.max(1, ...block.points.map((p) => p.value), block.reference?.value ?? 0) * 1.12;
  const H = 180;
  return (
    <figure className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LINE}` }}>
      <figcaption className="text-sm font-semibold" style={{ color: NAVY }}>{block.title}</figcaption>
      {block.note && <p className="text-xs mt-1" style={{ color: MUTED }}>{block.note}</p>}
      <div className="relative mt-5" style={{ height: H + 22 }}>
        {block.reference && (
          <div
            aria-hidden
            className="absolute left-0 right-0"
            style={{ bottom: 22 + (block.reference.value / max) * H, borderTop: "1.5px dashed #94a3b8" }}
          />
        )}
        <div className="absolute inset-x-0 bottom-0 flex items-end gap-1.5" style={{ height: H + 22 }}>
          {block.points.map((p) => (
            <div
              key={p.label}
              className="group flex-1 flex flex-col items-center justify-end h-full min-w-0"
              title={`${p.label}: ${fmt(p.value, block.unit)}${p.note ? ` (${p.note})` : ""}`}
            >
              <span className="relative text-[10.5px] font-semibold mb-1 px-0.5 whitespace-nowrap bg-white" style={{ color: "#334155" }}>
                {fmt(p.value, block.unit, true)}
              </span>
              <div
                className="w-full max-w-[44px] rounded-t transition-opacity group-hover:opacity-80"
                style={{ height: Math.max(2, (p.value / max) * H), background: BAR }}
              />
              <span className="text-[10.5px] mt-1.5 truncate w-full text-center" style={{ color: MUTED }}>
                {p.label}
                {p.note ? "*" : ""}
              </span>
            </div>
          ))}
        </div>
      </div>
      {block.reference && (
        <p className="mt-3 text-xs flex items-center gap-2" style={{ color: MUTED }}>
          <span aria-hidden style={{ display: "inline-block", width: 18, borderTop: "1.5px dashed #94a3b8" }} />
          {block.reference.label}: {fmt(block.reference.value, block.unit, true)}
        </p>
      )}
      {block.points.some((p) => p.note) && (
        <ul className="mt-2 space-y-0.5">
          {block.points.filter((p) => p.note).map((p) => (
            <li key={p.label} className="text-xs" style={{ color: MUTED }}>
              * {p.label}: {p.note}
            </li>
          ))}
        </ul>
      )}
    </figure>
  );
}

function Breakdown({ block }: { block: Extract<Block, { kind: "breakdown" }> }) {
  const total = block.items.reduce((a, b) => a + b.value, 0);
  const max = Math.max(1, ...block.items.map((i) => i.value));
  return (
    <figure className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LINE}` }}>
      <figcaption className="text-sm font-semibold" style={{ color: NAVY }}>{block.title}</figcaption>
      {block.note && <p className="text-xs mt-1" style={{ color: MUTED }}>{block.note}</p>}
      <table className="w-full text-sm mt-3">
        <tbody>
          {block.items.map((i) => (
            <tr key={i.label} style={{ borderTop: "1px solid #f1f5f9" }} title={i.note ?? undefined}>
              <td className="py-2 pr-3 align-top" style={{ color: "#1F2937" }}>
                {i.label}
                {i.note && <span className="block text-xs" style={{ color: MUTED }}>{i.note}</span>}
              </td>
              <td className="py-2 w-[38%] align-middle">
                <div className="rounded" style={{ background: "#f1f5f9", height: 8 }}>
                  <div className="rounded" style={{ background: BAR, height: 8, width: `${(i.value / max) * 100}%` }} />
                </div>
              </td>
              <td className="py-2 pl-3 text-right whitespace-nowrap font-semibold" style={{ color: "#1F2937" }}>
                {fmt(i.value, block.unit, true)}
              </td>
              {block.unit !== "percent" && block.unit !== "score" && (
                <td className="py-2 pl-2 text-right text-xs whitespace-nowrap" style={{ color: MUTED }}>
                  {total ? `${Math.round((i.value / total) * 100)}%` : ""}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </figure>
  );
}

function Findings({ block }: { block: Extract<Block, { kind: "findings" }> }) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LINE}` }}>
      <h3 className="text-sm font-semibold" style={{ color: NAVY }}>{block.title}</h3>
      <ul className="mt-3 space-y-3">
        {block.items.map((f) => (
          <li key={f.headline} className="flex gap-3">
            <div className="pt-0.5"><ToneChip tone={f.tone} /></div>
            <div>
              <p className="text-sm font-semibold" style={{ color: "#1F2937" }}>{f.headline}</p>
              <p className="text-sm mt-0.5 leading-relaxed" style={{ color: "#475569" }}>{f.detail}</p>
              {f.source && <p className="text-[11px] mt-1" style={{ color: "#94a3b8" }}>From: {f.source}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Checks({ block }: { block: Extract<Block, { kind: "checks" }> }) {
  return (
    <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LINE}` }}>
      <h3 className="text-sm font-semibold" style={{ color: NAVY }}>{block.title}</h3>
      {block.note && <p className="text-xs mt-1" style={{ color: MUTED }}>{block.note}</p>}
      <ul className="mt-3">
        {block.items.map((c) => {
          const s = CHECK[c.status];
          return (
            <li key={c.label} className="py-2.5 md:grid md:grid-cols-[30%_90px_1fr] md:gap-3" style={{ borderTop: "1px solid #f1f5f9" }}>
              <div className="flex items-center justify-between gap-2 md:contents">
                <span className="text-sm font-medium" style={{ color: "#1F2937" }}>{c.label}</span>
                <span>
                  <span className="rounded-full px-2 py-0.5 text-[11px] font-semibold whitespace-nowrap" style={{ background: s.bg, color: s.fg }}>
                    {s.word}
                  </span>
                </span>
              </div>
              <p className="text-sm mt-1 md:mt-0 leading-relaxed" style={{ color: "#475569" }}>{c.detail}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Compare({ block }: { block: Extract<Block, { kind: "compare" }> }) {
  return (
    <div className="bg-white rounded-xl p-5 overflow-x-auto" style={{ border: `1px solid ${LINE}` }}>
      <h3 className="text-sm font-semibold" style={{ color: NAVY }}>{block.title}</h3>
      {block.note && <p className="text-xs mt-1" style={{ color: MUTED }}>{block.note}</p>}
      <table className="w-full text-sm mt-3">
        <thead>
          <tr>
            <th />
            {block.columns.map((c) => (
              <th key={c} className="py-1.5 px-2 text-right text-xs font-semibold whitespace-nowrap" style={{ color: MUTED }}>{c}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {block.rows.map((r) => (
            <tr key={r.label} style={{ borderTop: "1px solid #f1f5f9" }}>
              <td className="py-2 pr-3" style={{ color: "#1F2937" }}>
                {r.label}
                {r.tone && r.tone !== "neutral" && <span className="ml-2"><ToneChip tone={r.tone} /></span>}
              </td>
              {r.values.map((v, i) => (
                <td key={i} className="py-2 px-2 text-right font-semibold whitespace-nowrap" style={{ color: "#1F2937" }}>
                  {v ?? "–"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case "kpis": return <Kpis items={block.items} />;
    case "series": return <Series block={block} />;
    case "breakdown": return <Breakdown block={block} />;
    case "findings": return <Findings block={block} />;
    case "checks": return <Checks block={block} />;
    case "compare": return <Compare block={block} />;
    case "text":
      return (
        <div className="bg-white rounded-xl p-5" style={{ border: `1px solid ${LINE}` }}>
          {block.title && <h3 className="text-sm font-semibold mb-1" style={{ color: NAVY }}>{block.title}</h3>}
          <p className="text-sm leading-relaxed whitespace-pre-line" style={{ color: "#334155" }}>{block.body}</p>
        </div>
      );
  }
}

export default function DashboardView({ data, asOf }: { data: DashboardData; asOf: Date }) {
  return (
    <div className="space-y-8">
      <div className="rounded-xl px-6 py-5" style={{ background: NAVY }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider" style={{ color: "#D4AF37" }}>
          {data.period} &middot; figures as at{" "}
          {new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric" }).format(asOf)}
        </p>
        <p className="text-lg font-semibold mt-2 leading-snug text-white">{data.headline}</p>
      </div>

      {data.sections.map((s) => (
        <section key={s.title} className="space-y-3">
          <div>
            <h2 className="text-lg font-bold" style={{ color: NAVY }}>{s.title}</h2>
            {s.lead && <p className="text-sm mt-0.5 leading-relaxed" style={{ color: MUTED }}>{s.lead}</p>}
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {s.blocks.map((b, i) => (
              <div key={i} className={b.kind === "series" || b.kind === "breakdown" ? "" : "md:col-span-2"}>
                <BlockView block={b} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <section className="rounded-xl p-5" style={{ background: "#F1F5F9" }}>
        <h2 className="text-sm font-semibold" style={{ color: NAVY }}>Where these figures come from</h2>
        <ul className="mt-2 space-y-1">
          {data.sources.map((s) => (
            <li key={s.name} className="text-xs leading-relaxed" style={{ color: "#475569" }}>
              <b>{s.name}.</b> {s.detail}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
