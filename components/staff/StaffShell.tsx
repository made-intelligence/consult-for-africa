import Link from "next/link";
import { paletteVars, type StaffSite } from "@/lib/staffSites";

export const LINE = "#E2E8F0";
export const MUTED = "#64748b";
export const INK = "var(--staff-ink)";
export const ACCENT = "var(--staff-accent)";
export const SECOND = "var(--staff-second)";

export const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: 16,
  padding: 20,
};

/** The frame every page of a staff site sits in: its colours, its header band, a narrow column. */
export default function StaffShell({
  site,
  title,
  lead,
  back,
  backTo,
  width = 760,
  children,
}: {
  site: StaffSite;
  title: string;
  lead?: string;
  /** Show a link back to the site's front page. */
  back?: boolean;
  /** A back link somewhere other than the front page. */
  backTo?: { href: string; label: string };
  width?: number;
  children: React.ReactNode;
}) {
  return (
    <main style={{ ...paletteVars(site), background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: "var(--staff-deep)", padding: "40px 16px 44px" }}>
        <div style={{ maxWidth: width, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: ACCENT, marginBottom: 16 }} />
          {backTo ? (
            <Link href={backTo.href} style={{ color: "var(--staff-head-label)", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; {backTo.label}</Link>
          ) : back ? (
            <Link href={site.pathPrefix} style={{ color: "var(--staff-head-label)", fontSize: 13.5, textDecoration: "none" }}>&lsaquo; The staff page</Link>
          ) : (
            <div style={{ color: "var(--staff-head-label)", fontWeight: 700, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase" }}>{site.clientName}</div>
          )}
          <h1 style={{ color: "#fff", fontSize: 30, lineHeight: 1.15, margin: "10px 0 0", letterSpacing: "-0.02em" }}>{title}</h1>
          {lead && <p style={{ color: "var(--staff-head-body)", fontSize: 16, lineHeight: 1.6, margin: "10px 0 0", maxWidth: 640 }}>{lead}</p>}
        </div>
      </div>
      <div style={{ maxWidth: width, margin: "0 auto", padding: "24px 16px 72px", boxSizing: "border-box" }}>{children}</div>
    </main>
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: SECOND, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>{children}</div>
  );
}

export function Section({ eyebrow, title, lead, id, children }: { eyebrow?: string; title: string; lead?: string; id?: string; children?: React.ReactNode }) {
  return (
    <section id={id} style={{ marginTop: 36, scrollMarginTop: 20 }}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 style={{ color: INK, fontSize: 22, lineHeight: 1.2, margin: "6px 0 0", letterSpacing: "-0.01em" }}>{title}</h2>
      {lead && <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.6, margin: "8px 0 0" }}>{lead}</p>}
      {children && <div style={{ marginTop: 16 }}>{children}</div>}
    </section>
  );
}
