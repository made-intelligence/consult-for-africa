/**
 * Getting Arabella ready, for Dr Chito and Tolu.
 *
 * Every step is read from what is already true in the system, so nothing has
 * to be ticked by hand and nothing can be ticked without being done. The list
 * disappears from her page once every step is done.
 *
 * Order is the order that unblocks the team: Tolu first (so she is not doing
 * it alone), then numbers (no number, no sign-in), then owners (no owner, no
 * daily numbers), then the rota (who is on), then her first decision and her
 * first approved training module.
 */
import { prisma } from "@/lib/prisma";
import { ARABELLA_DAILY } from "@/lib/arabella-daily";
import { ownersFor } from "@/lib/dailyReturn";
import { GO_LIVE, weekStart } from "@/lib/arabella-plan";

export interface OnboardingStep {
  code: string;
  title: string;
  /** What it is for, in one line. */
  why: string;
  /** Where the current state stands, e.g. "14 of 19 have a number". */
  status: string;
  done: boolean;
  href: string;
  action: string;
}

export interface Onboarding {
  steps: OnboardingStep[];
  doneCount: number;
  allDone: boolean;
  /** Whole days until the team's first week, 0 once it has started. */
  daysToGoLive: number;
  goLive: Date;
}

export async function arabellaOnboarding(clientId: string, meId: string, prefix: string, now: Date = new Date()): Promise<Onboarding> {
  const goLive = weekStart(1, GO_LIVE);
  const firstWeekEnd = weekStart(2, GO_LIVE);

  const [staff, decisions, approved, shifts] = await Promise.all([
    prisma.staffMember.findMany({
      where: { clientId, isActive: true, kind: { not: "TEST" } },
      select: { id: true, name: true, position: true, department: true, phone: true, email: true, tiers: true, lastLoginAt: true },
    }),
    prisma.decisionRequest.count({ where: { clientId } }),
    prisma.protocol.count({ where: { clientId, NOT: { approvedAt: null } } }),
    prisma.staffShift.count({ where: { staff: { clientId }, date: { gte: goLive, lt: firstWeekEnd } } }),
  ]);

  const others = staff.filter((s) => s.id !== meId);
  const leaders = others.filter((s) => s.tiers.includes("LEADERSHIP"));
  const leaderIn = leaders.find((s) => s.lastLoginAt);
  const noContact = others.filter((s) => !s.phone && !s.email);
  const firstPhase = ARABELLA_DAILY.sections.filter((s) => s.phase === 1);
  const unowned = firstPhase.filter((s) => ownersFor(s, staff).length === 0);
  const signedIn = others.filter((s) => s.lastLoginAt).length;

  const steps: OnboardingStep[] = [
    {
      code: "leader",
      title: "Bring Tolu in",
      why: "So the setting up is not yours alone. Tolu can add the team's numbers and run the daily close.",
      status: leaderIn ? `${leaderIn.name.split(" ")[0]} has signed in` : leaders.length ? "Not signed in yet" : "No one else has leadership access yet",
      done: !!leaderIn,
      href: `${prefix}/people`,
      action: leaders.length ? "Ask Tolu to sign in" : "Give Tolu leadership access",
    },
    {
      code: "numbers",
      title: "Add the team's mobile numbers",
      why: "A number is how each person signs in. Nobody is messaged until their number is in.",
      status: noContact.length === 0 ? `All ${others.length} have a number` : `${others.length - noContact.length} of ${others.length} have a number`,
      done: others.length > 0 && noContact.length === 0,
      href: `${prefix}/people`,
      action: "Add numbers",
    },
    {
      code: "owners",
      title: "Check who owns each daily area",
      why: "Each area of the daily view is filled in by one role. An area with nobody in that role stays empty.",
      status: unowned.length === 0
        ? `All ${firstPhase.length} first-week areas have an owner`
        : `No one yet for: ${unowned.map((s) => s.title).join(", ")}`,
      done: unowned.length === 0,
      href: `${prefix}/people`,
      action: "Match job titles",
    },
    {
      code: "rota",
      title: "Put in the rota for the first week",
      why: "The rota tells the app who is working. Nobody who is off is chased.",
      status: shifts > 0 ? `${shifts} shifts entered` : "Not entered yet",
      done: shifts > 0,
      href: `${prefix}/rota`,
      action: "Open the rota",
    },
    {
      code: "decision",
      title: "Try a decision",
      why: "Anything waiting on you lands in one list with its age. Raise one yourself to see how it reads.",
      status: decisions > 0 ? "Done" : "None yet",
      done: decisions > 0,
      href: `${prefix}#decide`,
      action: "Raise one",
    },
    {
      code: "training",
      title: "Approve the first training modules",
      why: "Nothing clinical reaches staff until you have read and approved it. Each takes a few minutes.",
      status: approved > 0 ? `${approved} approved` : "None approved yet",
      done: approved > 0,
      href: `${prefix}/learn`,
      action: "Review modules",
    },
  ];

  const doneCount = steps.filter((s) => s.done).length;
  const msDay = 24 * 60 * 60 * 1000;
  return {
    steps,
    doneCount,
    allDone: doneCount === steps.length && signedIn > 0,
    daysToGoLive: Math.max(0, Math.ceil((goLive.getTime() - now.getTime()) / msDay)),
    goLive,
  };
}
