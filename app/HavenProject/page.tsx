import type { Metadata } from "next";
import EvidenceUploader from "@/components/haven/EvidenceUploader";
import { WORKSTREAMS } from "@/lib/haven-delivery";

// One link for the Haven team for the six months: who holds which seat, what is
// due this month, and somewhere to put the evidence. Deliberately not indexed.

export const metadata: Metadata = {
  title: "Haven Paediatric Centre and Consult for Africa",
  description: "The six-month growth plan: who does what, what is due, and where to put it.",
  robots: { index: false, follow: false },
};

const NAVY = "#0B3C5D";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const card = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: 14,
  padding: 20,
} as const;

/** Month 1, from the milestone tracker. The months that follow are in the tracker PDF. */
const MONTH_ONE: { what: string; done: string; owner: string }[] = [
  {
    what: "Billing and revenue capture live",
    done: "Every service delivered is recorded and billed, and the handover sheet is retired as the revenue record.",
    owner: "Finance",
  },
  {
    what: "Tariffs mystery-shopped and the zero-priced lines repriced",
    done: "Five or six peers benchmarked, and the lines currently priced at zero given defensible prices.",
    owner: "Finance",
  },
  {
    what: "Receivables recovery push",
    done: "The first tranche of the N4.2M recovered from Leadway and NEM, with a weekly chase routine running.",
    owner: "Finance",
  },
  {
    what: "Vendor-managed inventory partner selected",
    done: "Consignment terms agreed, freeing the N2.77M held in stock and ending the stockouts.",
    owner: "Pharmacy",
  },
  {
    what: "Referral portal live and the call list worked",
    done: "The portal takes referrals and someone is working the hospital call list every day.",
    owner: "Business development",
  },
  {
    what: "NICU repriced and the catchment mapped",
    done: "A new NICU rate set, and every maternity unit and Ob/Gyn near GRA Ikeja ranked.",
    owner: "NICU and neonatology",
  },
  {
    what: "Senior operations leader: role defined, search live",
    done: "The spec and the KPIs written, and candidates being sourced.",
    owner: "Board",
  },
  {
    what: "Safety and just-culture quick wins",
    done: "The crash-cart standard locked, and the just-culture standard drafted from the survey.",
    owner: "Clinical lead",
  },
];

function SectionHeading({ eyebrow, title, lead }: { eyebrow: string; title: string; lead?: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
        {eyebrow}
      </div>
      <h2 style={{ color: NAVY, fontSize: 24, lineHeight: 1.2, margin: "6px 0 0" }}>{title}</h2>
      {lead && <p style={{ color: MUTED, fontSize: 15.5, lineHeight: 1.65, margin: "8px 0 0", maxWidth: 680 }}>{lead}</p>}
    </div>
  );
}

export default function HavenProjectPage() {
  return (
    <main style={{ background: "#f1f5f9", minHeight: "100vh", fontFamily: "-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,system-ui,sans-serif" }}>
      <header style={{ background: `linear-gradient(160deg,#0d456a,#081726)`, color: "#fff", padding: "40px 0 34px", borderBottom: `4px solid ${GOLD}` }}>
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "0 20px" }}>
          <div style={{ fontSize: 11, letterSpacing: ".24em", fontWeight: 800, color: "#eaf1f6" }}>
            CONSULT FOR <span style={{ color: GOLD }}>AFRICA</span>
          </div>
          <h1 style={{ fontFamily: "Georgia,'Times New Roman',serif", fontWeight: 400, fontSize: 30, lineHeight: 1.15, margin: "16px 0 10px" }}>
            Haven Paediatric Centre: the next six months
          </h1>
          <p style={{ color: "#c3d3de", fontSize: 15.5, maxWidth: "58ch", lineHeight: 1.6 }}>
            The growth plan starts on Tuesday 6 October. This page is where the work lives while it runs.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 820, margin: "0 auto", padding: "26px 20px 70px", display: "grid", gap: 26 }}>
        <div style={{ background: "#FBF6E6", borderLeft: `3px solid ${GOLD}`, borderRadius: "0 10px 10px 0", padding: "18px 22px" }}>
          <p style={{ color: "#3a4956", fontSize: 15, lineHeight: 1.7, margin: 0 }}>
            The audit is behind us and the strategy is agreed. What is left is the doing, and the doing is
            yours. Our job for the next six months is to make sure nobody has to wonder what they are meant
            to be working on, and that progress is visible to everyone rather than reconstructed at a meeting.
            Start by telling us who you are. Everything else follows from that.
          </p>
          <p style={{ color: NAVY, fontSize: 14.5, margin: "12px 0 0", fontWeight: 600 }}>Debo Odulana, Founding Partner</p>
        </div>

        <section style={card}>
          <SectionHeading
            eyebrow="First"
            title="Tell us who you are"
            lead="Each seat below gets its own short list of what is due, and somewhere to put the evidence when it is done. We cannot send you yours if we do not know you hold it."
          />
          <a
            href="/haven-contacts.html"
            style={{
              display: "inline-block", background: NAVY, color: "#fff", textDecoration: "none",
              borderRadius: 9, padding: "14px 22px", fontSize: 15.5, fontWeight: 700,
            }}
          >
            Register me, it takes a minute
          </a>
          <div style={{ marginTop: 18, display: "grid", gap: 8 }}>
            {WORKSTREAMS.filter((w) => w.key !== "other").map((w) => (
              <div key={w.key} style={{ display: "flex", gap: 12, alignItems: "baseline", fontSize: 14.5, lineHeight: 1.6 }}>
                <span style={{ color: NAVY, fontWeight: 700, minWidth: 190 }}>{w.role}</span>
                <span style={{ color: MUTED }}>{w.owns}</span>
              </div>
            ))}
          </div>
        </section>

        <section style={card}>
          <SectionHeading
            eyebrow="Month one, days 1 to 30"
            title="Stabilise and switch on the engine"
            lead="Eight things. The target at the end of the month is a run rate of about N16M."
          />
          <div style={{ display: "grid", gap: 10 }}>
            {MONTH_ONE.map((m, i) => (
              <div
                key={m.what}
                style={{
                  border: `1px solid ${LINE}`, borderRadius: 11, padding: "14px 16px",
                  background: i % 2 ? "#fbfdff" : "#fff",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
                  <strong style={{ color: NAVY, fontSize: 15.5 }}>{m.what}</strong>
                  <span style={{ color: TEAL, fontSize: 12.5, fontWeight: 700, whiteSpace: "nowrap" }}>{m.owner}</span>
                </div>
                <p style={{ color: MUTED, fontSize: 14, lineHeight: 1.6, margin: "6px 0 0" }}>{m.done}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={card}>
          <SectionHeading
            eyebrow="As you go"
            title="Put the evidence here"
            lead="When something is done, put up the thing that proves it: the export, the signed agreement, the stock count, the photograph of the board. It saves everyone a meeting."
          />
          <EvidenceUploader />
        </section>

        <footer style={{ color: MUTED, fontSize: 12.5, lineHeight: 1.8, textAlign: "center" }}>
          This page is private and is not listed anywhere. What you share here is used for this engagement
          only, by Consult for Africa and Haven&rsquo;s leadership.
          <br />
          Consult for Africa Management Services Limited
        </footer>
      </div>
    </main>
  );
}
