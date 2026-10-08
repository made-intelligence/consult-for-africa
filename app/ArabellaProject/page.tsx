import type { Metadata } from "next";
import DocumentUploader from "@/components/arabella/DocumentUploader";
import { DOCUMENTS, PRIORITY_EIGHT, REQUEST_SECTIONS, SURVEYS } from "@/lib/arabella-audit";

// One link for Dr Chito and the Arabella team: the request document, the four
// surveys, and somewhere to put the answers. Deliberately not indexed.

export const metadata: Metadata = {
  title: "Arabella Women's Health and Consult for Africa",
  description: "The diagnostic audit: what we are doing, what we need, and where to put it.",
  robots: { index: false, follow: false },
};

const NAVY = "#0B3C5D";
const DEEP = "#081521";
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

const STAGES: { when: string; what: string }[] = [
  {
    when: "Records",
    what: "Records and systems reviewed. Revenue rebuilt from the ledger and traced to the bank, and the baseline agreed with you.",
  },
  {
    when: "Conversations",
    what: "Short conversations with staff, individually and confidentially, with the four surveys running alongside. Nothing anybody says is reported back with a name attached.",
  },
  {
    when: "On site",
    what: "The patient journey traced end to end on live cases. Pharmacy and stock counted. The patient database reviewed with you, on your own machine.",
  },
  {
    when: "Findings",
    what: "Findings tested with you before anything is written down.",
  },
  {
    when: "By end November",
    what: "The written diagnostic: what Arabella earns, where it leaks, what the operation can carry, and what to fix in what order. Plus the technology and records report with a prioritised roadmap.",
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

function DownloadRow({ href, title, meta, blurb }: { href: string; title: string; meta: string; blurb: string }) {
  return (
    <a
      href={href}
      style={{
        display: "flex", gap: 14, alignItems: "flex-start", textDecoration: "none",
        border: `1px solid ${LINE}`, borderRadius: 12, padding: "14px 16px", background: "#fff",
      }}
    >
      <span
        aria-hidden
        style={{
          flex: "0 0 auto", width: 34, height: 34, borderRadius: 9, background: "#F1F5F9",
          color: NAVY, fontSize: 11, fontWeight: 800, display: "grid", placeItems: "center",
        }}
      >
        PDF
      </span>
      <span style={{ flex: 1 }}>
        <span style={{ display: "block", color: NAVY, fontWeight: 700, fontSize: 15.5 }}>{title}</span>
        <span style={{ display: "block", color: MUTED, fontSize: 13.5, marginTop: 3, lineHeight: 1.55 }}>{blurb}</span>
      </span>
      <span style={{ color: TEAL, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap" }}>{meta}</span>
    </a>
  );
}

export default function ArabellaProjectPage() {
  return (
    <main style={{ background: "#eef2f6", minHeight: "100vh", color: "#1F2937" }}>
      <header style={{ background: NAVY, borderBottom: `3px solid ${GOLD}` }}>
        <div style={{ maxWidth: 860, margin: "0 auto", padding: "30px 18px 32px" }}>
          <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
            Arabella Women&rsquo;s Health and Consult for Africa
          </div>
          <h1 style={{ color: "#fff", fontSize: 30, lineHeight: 1.18, margin: "10px 0 0", fontWeight: 800 }}>
            The diagnostic audit
          </h1>
          <p style={{ color: "#C9D6E0", fontSize: 16, margin: "10px 0 0", lineHeight: 1.6, maxWidth: 620 }}>
            Everything for this piece of work lives on this page. Read the request, send us what we
            have asked for, and answer whichever survey applies to you.
          </p>
          <p style={{ color: "#8FA8BC", fontSize: 13.5, margin: "16px 0 0" }}>
            Audit under way. Written diagnostic by the end of November 2026.
          </p>
        </div>
      </header>

      <div style={{ maxWidth: 860, margin: "0 auto", padding: "0 18px 72px" }}>
        {/* A word from Debo, so the page has a person behind it */}
        <section style={{ ...card, background: "#FBF6E6", borderLeft: `4px solid ${GOLD}`, marginTop: 22 }}>
          <p style={{ margin: 0, fontSize: 15.5, lineHeight: 1.7 }}>
            We are not here to write a view of the Abuja women&rsquo;s health market. We want
            to establish what Arabella actually earns today, where the patients and the money leak
            out between the first enquiry and the bank account, and whether the operation can carry
            the premium promise the brand is about to make. Nothing on this page is a test. Where a
            record does not exist, the right answer is to tell us it does not exist, because the
            absence is itself useful and it is usually more useful than a tidy file would have been.
          </p>
          <p style={{ margin: "12px 0 0", fontWeight: 700, color: NAVY, fontSize: 14.5 }}>
            Dr Debo Odulana, Founding Partner, Consult for Africa
          </p>
        </section>

        {/* 1. The document */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="Start here"
            title="The request"
            lead="Everything we have asked for, why each part matters, and how the audit runs from here."
          />
          <div style={{ display: "grid", gap: 10 }}>
            {DOCUMENTS.map((d) => (
              <DownloadRow key={d.href} href={d.href} title={d.title} meta={d.pages} blurb={d.blurb} />
            ))}
          </div>
        </section>

        {/* 2. The eight */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="Start with these"
            title="The eight that matter most"
            lead="These eight unlock everything else. If time is short, send these first and let the rest follow."
          />
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {PRIORITY_EIGHT.map((p, i) => (
              <div
                key={p.n}
                style={{
                  display: "flex", gap: 14, padding: "14px 18px",
                  borderTop: i === 0 ? "none" : `1px solid #F1F5F9`,
                  background: i % 2 ? "#FBFDFE" : "#fff",
                }}
              >
                <span style={{ color: GOLD, fontWeight: 800, fontSize: 15, minWidth: 18 }}>{p.n}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 15, color: "#1F2937", lineHeight: 1.5 }}>{p.what}</span>
                  <span style={{ display: "block", fontSize: 13, color: MUTED, marginTop: 3 }}>{p.why}</span>
                </span>
                <span style={{ color: TEAL, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap" }}>
                  section {p.section}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Uploads */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="Send it to us"
            title="Upload what you have"
            lead="Straight from here, as many times as you like. There is no need to wait until you have everything, and no need to set up a shared folder unless you would rather. Send what exists today and add to it. Please do not upload anything that names a patient, including the patient database: we will look at that with you on site."
          />
          <DocumentUploader />
        </section>

        {/* 4. The full request, so they can see the shape without opening the PDF */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="For reference"
            title="Everything we have asked for"
            lead="The full list, with the detail under each heading, is in the request above."
          />
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {REQUEST_SECTIONS.map((s, i) => (
              <div
                key={s.key}
                style={{
                  display: "flex", gap: 14, padding: "12px 18px",
                  borderTop: i === 0 ? "none" : `1px solid #F1F5F9`,
                }}
              >
                <span style={{ color: NAVY, fontWeight: 800, fontSize: 13.5, minWidth: 16 }}>{s.key}</span>
                <span style={{ flex: 1 }}>
                  <span style={{ display: "block", fontSize: 14.5, color: "#1F2937", fontWeight: 600 }}>{s.title}</span>
                  <span style={{ display: "block", fontSize: 13, color: MUTED, marginTop: 2, lineHeight: 1.5 }}>{s.hint}</span>
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* 5. Surveys */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="Four short surveys"
            title="Whichever one applies to you"
            lead="The staff and patient surveys are anonymous, and those answers come to Consult for Africa rather than to anyone at Arabella."
          />
          <div style={{ display: "grid", gap: 12 }}>
            {SURVEYS.map((s) => (
              <a
                key={s.href}
                href={s.href}
                style={{ ...card, display: "block", textDecoration: "none", borderLeft: `4px solid ${TEAL}` }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "baseline" }}>
                  <div>
                    <div style={{ fontSize: 11.5, color: TEAL, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".1em" }}>
                      {s.who}
                    </div>
                    <div style={{ color: NAVY, fontWeight: 800, fontSize: 18, marginTop: 3 }}>{s.title}</div>
                  </div>
                  <span
                    style={{
                      background: "#F1F5F9", color: NAVY, borderRadius: 20, padding: "4px 11px",
                      fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
                    }}
                  >
                    {s.tag}
                  </span>
                </div>
                <p style={{ color: "#334155", fontSize: 14.5, lineHeight: 1.6, margin: "9px 0 0" }}>{s.blurb}</p>
                <div style={{ color: GOLD, fontWeight: 700, fontSize: 13.5, marginTop: 10 }}>
                  Open the survey &rarr; <span style={{ color: MUTED, fontWeight: 400 }}>{s.minutes}</span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* 6. How it runs */}
        <section style={{ marginTop: 40 }}>
          <SectionHeading
            eyebrow="What happens when"
            title="How the audit runs from here"
            lead="So that the team knows what is coming and nobody is surprised by a request."
          />
          <div style={{ ...card, padding: 0, overflow: "hidden" }}>
            {STAGES.map((f, i) => (
              <div
                key={i}
                style={{
                  display: "flex", gap: 16, padding: "15px 18px",
                  borderTop: i === 0 ? "none" : `1px solid #F1F5F9`,
                  background: i % 2 ? "#FBFDFE" : "#fff",
                }}
              >
                <span style={{ color: TEAL, fontWeight: 800, fontSize: 12.5, minWidth: 104, lineHeight: 1.5 }}>
                  {f.when}
                </span>
                <span style={{ flex: 1, fontSize: 14.5, lineHeight: 1.6 }}>{f.what}</span>
              </div>
            ))}
          </div>
          <p style={{ color: MUTED, fontSize: 13.5, lineHeight: 1.7, margin: "14px 2px 0" }}>
            Two working practices, so they are agreed rather than assumed. We ask staff questions
            directly and confidentially, because a team tells an outsider things it will not put in
            front of the founder, and none of it comes back with a name attached. And we trace real
            patients through the real process rather than sampling broadly, because a few episodes
            followed completely tell you more than a hundred counted partially.
          </p>
        </section>

        {/* 7. Footer */}
        <footer
          style={{
            marginTop: 44, paddingTop: 22, borderTop: `1px solid ${LINE}`,
            color: MUTED, fontSize: 13, lineHeight: 1.7,
          }}
        >
          <div style={{ width: 54, height: 3, background: GOLD, marginBottom: 14 }} />
          <p style={{ margin: 0 }}>
            This page is private to Arabella Women&rsquo;s Health and is not listed anywhere.
            Everything shared through it is confidential to Consult for Africa, is used only for
            this audit, and is not shared with any hospital, payer, supplier or other party.
          </p>
          <p style={{ margin: "12px 0 0", color: DEEP, fontWeight: 600 }}>
            Consult for Africa &middot; hello@consultforafrica.com &middot; +234 913 813 8553 &middot; consultforafrica.com
          </p>
        </footer>
      </div>
    </main>
  );
}
