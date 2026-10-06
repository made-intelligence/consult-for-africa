import type { Metadata } from "next";
import Link from "next/link";
import { NearMissForm, WhatsBrokenForm } from "@/components/haven/StaffForms";
import { getStaffSession, atLeast } from "@/lib/staffAuth";

// The temporary staff page for Haven Paediatric Centre, standing in for the
// staff app until that exists. Unindexed and unlisted: the link is the control,
// so nothing here may be above the ALL_STAFF tier in lib/haven-playbook.ts.
//
// Specifically NOT on this page, and not to be added later without a decision:
// anything with money in it, the audit report, the establishment gap, anything
// from the board, and anyone's individual assessment result.

export const metadata: Metadata = {
  title: "Haven Paediatric Centre: staff page",
  description: "What we are building together, and where to tell us what is broken.",
  robots: { index: false, follow: false },
};

const NAVY = "#0B3C5D";
const DEEP = "#081521";
const GOLD = "#D4AF37";
const TEAL = "#1F7A8C";
const LINE = "#E2E8F0";
const MUTED = "#64748b";

const shell: React.CSSProperties = {
  maxWidth: 760,
  margin: "0 auto",
  padding: "0 20px 72px",
};

const card: React.CSSProperties = {
  background: "#fff",
  border: `1px solid ${LINE}`,
  borderRadius: 16,
  padding: 24,
};

function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ color: GOLD, fontWeight: 700, fontSize: 11.5, letterSpacing: ".14em", textTransform: "uppercase" }}>
      {children}
    </div>
  );
}

function Section({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
}) {
  return (
    <section style={{ marginTop: 44 }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <h2 style={{ color: NAVY, fontSize: 25, lineHeight: 1.2, margin: "8px 0 0", letterSpacing: "-0.01em" }}>{title}</h2>
      {lead && (
        <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, margin: "10px 0 0" }}>{lead}</p>
      )}
      {children && <div style={{ marginTop: 20 }}>{children}</div>}
    </section>
  );
}

const DOCS = [
  {
    href: "/haven-staff-pack.pdf",
    title: "Welcome to Haven, Again",
    blurb: "The onboarding and reorientation pack. Why everybody is starting again at the same time, what we are trying to achieve, and what changes on your shift.",
  },
  {
    href: "/haven-town-hall.pdf",
    title: "The town hall",
    blurb: "The slides from the staff town hall, so you can go back over any of it.",
  },
];

// The documents and both forms are open without signing in, deliberately. The
// forms are anonymous by default and a sign-in wall in front of them would make
// that untrue in practice, whatever the form said. Signing in adds what is tied
// to a person or a tier: their area's numbers, the rota, the standards.
//
// Submitting while signed in still attaches no identity. The forms post only
// what the person typed, and the name field stays optional and blank.
export default async function HavenStaffPage() {
  const session = await getStaffSession();

  return (
    <main style={{ background: "#F8FAFC", minHeight: "100vh", fontFamily: "system-ui, -apple-system, Segoe UI, Helvetica, Arial, sans-serif" }}>
      <div style={{ background: DEEP, padding: "52px 20px 56px" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <div style={{ width: 44, height: 3, background: GOLD, marginBottom: 18 }} />
          <div style={{ color: "#9FC6D1", fontWeight: 700, fontSize: 11.5, letterSpacing: ".16em", textTransform: "uppercase" }}>
            Haven Paediatric Centre
          </div>
          <h1 style={{ color: "#fff", fontSize: 34, lineHeight: 1.15, margin: "12px 0 0", letterSpacing: "-0.02em" }}>
            The staff page
          </h1>
          <p style={{ color: "#B9CBD8", fontSize: 17, lineHeight: 1.6, margin: "14px 0 0", maxWidth: 580 }}>
            A fuller hospital that is still a safe one. The cots in use, nothing running out, nothing
            missed, and nobody finding out about a problem too late to fix it.
          </p>
        </div>
      </div>

      <div style={shell}>
        <Section
          eyebrow="Start here"
          title="The two documents"
          lead="Both were handed out at the town hall. The pack is the one worth twenty minutes."
        >
          <div style={{ display: "grid", gap: 14 }}>
            {DOCS.map((d) => (
              <a
                key={d.href}
                href={d.href}
                style={{ ...card, display: "block", textDecoration: "none", borderLeft: `4px solid ${GOLD}` }}
              >
                <div style={{ color: NAVY, fontSize: 18, fontWeight: 700 }}>{d.title}</div>
                <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>{d.blurb}</p>
                <div style={{ color: TEAL, fontSize: 14, fontWeight: 600, marginTop: 10 }}>Open the PDF</div>
              </a>
            ))}
          </div>
        </Section>

        <Section
          eyebrow="Speaking up"
          title="Report a near miss"
          lead="Something that nearly went wrong and you caught it. Nobody gets into trouble for this. A near miss is the cheapest lesson a hospital ever gets, and what we look for in every one is what made it possible, never who was involved."
        >
          <div style={card}>
            <NearMissForm />
          </div>
        </Section>

        <Section
          eyebrow="Speaking up"
          title="Tell us what is broken"
          lead="Anything that wastes your time or does not work. One line is enough. You know where this hospital leaks time and effort far better than anyone who arrives with a clipboard."
        >
          <div style={card}>
            <WhatsBrokenForm />
          </div>
        </Section>

        {session ? (
          <Section
            eyebrow={`Signed in as ${session.name.split(" ")[0]}`}
            title="Your area"
            lead={
              atLeast(session, "SUPERVISOR")
                ? "Your unit's numbers, your team's outstanding tasks and the rota will appear here as each one is built."
                : "Your tasks, your standards and the rota will appear here as each one is built."
            }
          >
            <div style={{ ...card, color: MUTED, fontSize: 15, lineHeight: 1.65 }}>
              Nothing to show yet. The scoreboard and the standards are being built now, and this is
              where they will land for you.
            </div>
          </Section>
        ) : (
          <Section
            eyebrow="For more"
            title="Sign in"
            lead="The documents and both forms above work without signing in, and the forms stay anonymous either way. Signing in is for the things tied to you: your tasks, your rota, your area's numbers."
          >
            <Link
              href="/HavenStaff/login"
              style={{ ...card, display: "block", textDecoration: "none", borderLeft: `4px solid ${TEAL}` }}
            >
              <div style={{ color: NAVY, fontSize: 17, fontWeight: 700 }}>Sign in with your email</div>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>
                We send you a link. There is no password to remember.
              </p>
            </Link>
          </Section>
        )}

        <Section
          eyebrow="Coming here"
          title="What will appear on this page"
          lead="Keep the link. This is where the rest of it will live as it is built."
        >
          <div style={{ ...card, display: "grid", gap: 14 }}>
            {[
              ["The scoreboard", "Six things, updated weekly, so you never have to guess whether it is working."],
              ["The standards of work", "Published for each area as that team writes and signs off its own."],
              ["The rota", "Published four weeks ahead."],
              ["What changed because you wrote in", "Short notes on what people reported and what we did about it."],
            ].map(([t, b]) => (
              <div key={t} style={{ borderLeft: `3px solid ${TEAL}`, paddingLeft: 14 }}>
                <div style={{ color: NAVY, fontWeight: 700, fontSize: 15.5 }}>{t}</div>
                <p style={{ color: MUTED, fontSize: 14.5, lineHeight: 1.6, margin: "4px 0 0" }}>{b}</p>
              </div>
            ))}
          </div>
        </Section>

        <Section eyebrow="Anything else" title="Who to go to">
          <div style={{ ...card, color: MUTED, fontSize: 15.5, lineHeight: 1.7 }}>
            <p style={{ margin: 0 }}>
              For your shift, your rota or your work day, your line manager, as now. For anything
              clinical, the Chief Medical Director, as now.
            </p>
            <p style={{ margin: "12px 0 0" }}>
              For anything about this programme, or anything you would rather say to somebody from
              outside the hospital, use the forms above or stop any of us in a corridor.
            </p>
            <p style={{ margin: "16px 0 0", color: NAVY, fontWeight: 600 }}>
              Consult for Africa &nbsp;·&nbsp; hello@consultforafrica.com
            </p>
          </div>
        </Section>

        <p style={{ marginTop: 40, fontSize: 13, color: MUTED, lineHeight: 1.6 }}>
          This page is for Haven staff. Please do not share the link outside the hospital.
        </p>
      </div>
    </main>
  );
}
