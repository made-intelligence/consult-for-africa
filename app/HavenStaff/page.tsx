import type { Metadata } from "next";
import Link from "next/link";
import { NearMissForm, WhatsBrokenForm, WeeklyPulse } from "@/components/haven/StaffForms";
import StaffDirectory, { type DirectoryEntry } from "@/components/haven/StaffDirectory";
import { MyLeave, LeaveToDecide, type LeaveRow } from "@/components/haven/StaffLeave";
import StaffNotes, { type NoteRow } from "@/components/haven/StaffNotes";
import Scoreboard, { type ScoreRow } from "@/components/haven/Scoreboard";
import { isoWeek, previousWeek } from "@/lib/havenScoreboard";
import { whatsWaiting, type WaitingItem } from "@/lib/havenToday";
import TodayTasks, { type TodayTask } from "@/components/haven/TodayTasks";
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
  id,
}: {
  eyebrow: string;
  title: string;
  lead?: string;
  children?: React.ReactNode;
  id?: string;
}) {
  return (
    <section id={id} style={{ marginTop: 44, scrollMarginTop: 20 }}>
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
    href: "/api/haven-staff/doc/staff-pack",
    title: "Welcome to Haven, Again",
    blurb: "The onboarding and reorientation pack. Why everybody is starting again at the same time, what we are trying to achieve, and what changes on your shift.",
  },
  {
    href: "/api/haven-staff/doc/town-hall",
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
  let notes: NoteRow[] = [];
  let myDepartment = "";
  let thisWeek: ScoreRow[] = [];
  let lastWeek: ScoreRow[] = [];
  const period = isoWeek();
  let waiting: WaitingItem[] = [];
  let todayTasks: TodayTask[] = [];

  if (session) {
    const [dir, me, leave] = await Promise.all([
      prisma.staffMember.findMany({
        where: { clientId: session.clientId, isActive: true },
        select: { name: true, position: true, department: true, phone: true },
        orderBy: { name: "asc" },
      }),
      prisma.staffMember.findUnique({
        where: { id: session.sub },
        select: { annualLeaveDays: true, department: true },
      }),
      prisma.staffLeaveRequest.findMany({
        where: { staffId: session.sub },
        orderBy: { startDate: "desc" },
        take: 12,
      }),
    ]);
    people = dir;
    waiting = await whatsWaiting(session);

    // Today's tickable tasks. Separate from the waiting list because these are
    // things you do here rather than somewhere else, and a link to a checkbox
    // is one tap more than a checkbox.
    const day = new Date();
    const forDate = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth(), day.getUTCDate()));
    const meRow = await prisma.staffMember.findUnique({
      where: { id: session.sub },
      select: { position: true, department: true },
    });
    const allTasks = await prisma.staffTask.findMany({
      where: { clientId: session.clientId, isActive: true, cadence: { in: ["EVERY_SHIFT", "DAILY"] } },
      select: { id: true, title: true, why: true, roles: true },
      orderBy: { sortOrder: "asc" },
    });
    const [done, flags] = await Promise.all([
      prisma.staffTaskCompletion.findMany({ where: { staffId: session.sub, forDate }, select: { taskId: true } }),
      prisma.staffTaskFlag.findMany({ where: { staffId: session.sub, resolvedAt: null }, select: { taskId: true } }),
    ]);
    const doneIds = new Set(done.map((d) => d.taskId));
    const flaggedIds = new Set(flags.map((f) => f.taskId));
    const hay = `${meRow?.position ?? ""} ${meRow?.department ?? ""}`.toLowerCase();
    todayTasks = allTasks
      .filter((x) => x.roles.length === 0 || x.roles.some((r) => {
        const n = r.toLowerCase().replace(/^every /, "").replace(/s$/, "");
        return hay.includes(n) || n.includes("everybody") || n.includes("all ");
      }))
      .map((x) => ({ id: x.id, title: x.title, why: x.why, done: doneIds.has(x.id), flagged: flaggedIds.has(x.id) }));
    entitlement = me?.annualLeaveDays ?? 20;
    myDepartment = me?.department ?? "";

    // Everything addressed to the whole hospital, plus this person's own area.
    const raw = await prisma.staffNote.findMany({
      where: {
        clientId: session.clientId,
        parentId: null,
        OR: [{ scope: "ALL" }, { scope: "DEPARTMENT", department: myDepartment }],
      },
      include: {
        author: { select: { name: true, position: true } },
        replies: {
          orderBy: { createdAt: "asc" },
          include: { author: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 25,
    });
    const scores = await prisma.scoreboardEntry.findMany({
      where: { clientId: session.clientId, period: { in: [period, previousWeek(period)] } },
      select: {
        measure: true, value: true, movedBy: true, period: true, enteredById: true,
        agreedBy: { select: { name: true } },
      },
    });
    const shape = (s: (typeof scores)[number]) => ({
      measure: s.measure,
      value: s.value,
      movedBy: s.movedBy,
      agreedBy: s.agreedBy?.name ?? null,
      enteredByMe: s.enteredById === session.sub,
    });
    thisWeek = scores.filter((s) => s.period === period).map(shape);
    lastWeek = scores.filter((s) => s.period !== period).map(shape);

    notes = raw.map((n) => ({
      id: n.id,
      body: n.body,
      author: n.author.name,
      role: n.author.position,
      scope: n.scope,
      department: n.department,
      createdAt: n.createdAt.toISOString(),
      replies: n.replies.map((r) => ({
        id: r.id, body: r.body, author: r.author.name, createdAt: r.createdAt.toISOString(),
      })),
    }));
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
            <section id="today" style={{ marginTop: 40 }}>
              <Eyebrow>{`Hello ${session.name.split(" ")[0]}`}</Eyebrow>
              <h2 style={{ color: NAVY, fontSize: 25, lineHeight: 1.2, margin: "8px 0 0", letterSpacing: "-0.01em" }}>
                {waiting.length === 0 && todayTasks.every((x) => x.done) ? "Nothing is waiting on you" : "Today"}
              </h2>
              {todayTasks.length > 0 && (
                <div style={{ marginTop: 20 }}>
                  <TodayTasks tasks={todayTasks} />
                </div>
              )}
              {waiting.length === 0 ? (
                <p style={{ color: MUTED, fontSize: 16, lineHeight: 1.65, margin: "10px 0 0" }}>
                  Everything is up to date. Have a look at the team notes, or tell us what is broken.
                </p>
              ) : (
                <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
                  {waiting.map((w, i) => (
                    <a
                      key={`${w.kind}-${i}`}
                      href={w.href}
                      style={{
                        ...card,
                        display: "flex",
                        alignItems: "center",
                        gap: 14,
                        textDecoration: "none",
                        padding: 16,
                        borderLeft: `4px solid ${w.urgency === "NOW" ? "#B0392B" : w.urgency === "TODAY" ? GOLD : TEAL}`,
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ color: NAVY, fontWeight: 650, fontSize: 15.5 }}>{w.title}</div>
                        {w.detail && (
                          <div style={{ color: MUTED, fontSize: 13.5, marginTop: 2 }}>{w.detail}</div>
                        )}
                      </div>
                      <span style={{ color: TEAL, fontSize: 20, flexShrink: 0 }} aria-hidden>&rsaquo;</span>
                    </a>
                  ))}
                </div>
              )}
            </section>

            <Section
              eyebrow="The team"
              title="Everyone's number"
              lead="The whole team, by department, in your pocket. Tap to call."
            >
              <StaffDirectory people={people} />
            </Section>

            <Section
              id="numbers"
              eyebrow="How we are doing"
              title="This week"
              lead="Six things, counted every week. Where a number moved, what moved it is written underneath."
            >
              <Scoreboard
                thisWeek={thisWeek}
                lastWeek={lastWeek}
                canEdit={atLeast(session, "SUPERVISOR")}
                period={period}
              />
            </Section>

            <Section
              eyebrow="The team"
              title="Notes"
              lead="Tell your area or the whole hospital something: a handover note, asking for cover, something that needs picking up. Everyone signed in can read it, which is the point."
            >
              <StaffNotes notes={notes} myDepartment={myDepartment} />
            </Section>

            <Section
              id="leave"
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
              id="pulse"
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
