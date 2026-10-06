import type { Metadata } from "next";
import Link from "next/link";
import { NearMissForm, WhatsBrokenForm, WeeklyPulse } from "@/components/haven/StaffForms";
import StaffDirectory, { type DirectoryEntry } from "@/components/haven/StaffDirectory";
import { MyLeave, LeaveToDecide, type LeaveRow } from "@/components/haven/StaffLeave";
import { prisma } from "@/lib/prisma";
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

  // The directory is the one thing here that gives rather than asks, and it is
  // also the reason to sign in. Loaded only for a signed-in person: these are
  // nineteen colleagues' personal mobiles and they do not belong on a page
  // anybody with the link can open.
  let people: DirectoryEntry[] = [];
  let mine: LeaveRow[] = [];
  let toDecide: LeaveRow[] = [];
  let entitlement = 20;

  if (session) {
    const [dir, me, leave] = await Promise.all([
      prisma.staffMember.findMany({
        where: { clientId: session.clientId, isActive: true },
        select: { name: true, position: true, department: true, phone: true },
        orderBy: { name: "asc" },
      }),
      prisma.staffMember.findUnique({
        where: { id: session.sub },
        select: { annualLeaveDays: true },
      }),
      prisma.staffLeaveRequest.findMany({
        where: { staffId: session.sub },
        orderBy: { startDate: "desc" },
        take: 12,
      }),
    ]);
    people = dir;
    entitlement = me?.annualLeaveDays ?? 20;
    mine = leave.map((l) => ({
      id: l.id, type: l.type, days: l.days, status: l.status,
      startDate: l.startDate.toISOString().slice(0, 10),
      endDate: l.endDate.toISOString().slice(0, 10),
      decisionNote: l.decisionNote,
    }));

    if (atLeast(session, "SUPERVISOR")) {
      const waiting = await prisma.staffLeaveRequest.findMany({
        where: {
          status: "REQUESTED",
          staff: { clientId: session.clientId, isActive: true },
          NOT: { staffId: session.sub },
        },
        include: { staff: { select: { name: true } } },
        orderBy: { startDate: "asc" },
      });
      toDecide = waiting.map((l) => ({
        id: l.id, type: l.type, days: l.days, status: l.status,
        startDate: l.startDate.toISOString().slice(0, 10),
        endDate: l.endDate.toISOString().slice(0, 10),
        decisionNote: l.decisionNote, reason: l.reason, staffName: l.staff.name,
      }));
    }
  }

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
        {session ? (
          <>
            <Section
              eyebrow={`Signed in as ${session.name.split(" ")[0]}`}
              title="Everyone's number"
              lead="The whole team, by department, in your pocket. Tap to call."
            >
              <StaffDirectory people={people} />
            </Section>

            <Section
              eyebrow="Your leave"
              title="Time off"
              lead="Ask from here rather than chasing somebody down a corridor. You will see who else in your area is already off before you pick your dates."
            >
              <MyLeave mine={mine} entitlement={entitlement} />
            </Section>

            {atLeast(session, "SUPERVISOR") && (
              <Section
                eyebrow="For you to decide"
                title="Leave waiting on you"
                lead="Approve or decline. Nobody can decide their own."
              >
                <LeaveToDecide pending={toDecide} />
              </Section>
            )}

            <Section
              eyebrow="Once a week"
              title="How has your week been?"
              lead="One tap is a complete answer. We publish how many people answered, and what changed because of it."
            >
              <div style={card}>
                <WeeklyPulse />
              </div>
            </Section>
          </>
        ) : (
          <Section
            eyebrow="Start here"
            title="Sign in for the staff directory"
            lead="Everyone's name, role and number, by department, so you are not scrolling WhatsApp at three in the morning looking for whoever is on. Signing in takes one code to your email. There is no password to remember."
          >
            <Link
              href="/HavenStaff/login"
              style={{ ...card, display: "block", textDecoration: "none", borderLeft: `4px solid ${GOLD}` }}
            >
              <div style={{ color: NAVY, fontSize: 17, fontWeight: 700 }}>Sign in</div>
              <p style={{ color: MUTED, fontSize: 15, lineHeight: 1.6, margin: "6px 0 0" }}>
                Everything below works without it, and the forms are anonymous either way.
              </p>
            </Link>
          </Section>
        )}

        <Section
          eyebrow="The documents"
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
