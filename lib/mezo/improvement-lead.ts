/**
 * Facilities Mezo has assessed, arriving as leads.
 *
 * Mezo assesses facilities against its facility standard and, after a fair
 * report, invites them to the Mezo Readiness Programme. The work it leads to
 * (licensing, infection prevention, theatre safety, governance, or Mezo running
 * the site outright) is hospital operations and clinical governance work this
 * firm delivers, behind Mezo: the facility only ever deals with Mezo.
 *
 * Mezo signs each opportunity with the same shared secret the CadreHealth
 * handoff uses the other way (MEZO_PARTNER_SECRET), so this module verifies
 * before it parses, and turns the opportunity into one Lead per facility,
 * updated in place when Mezo sends it again. See docs/mezo-improvement-leads.md.
 */
import { createHmac, timingSafeEqual } from "crypto";
import { z } from "zod";

export const MEZO_LEAD_SOURCE = "MEZO_NETWORK";
export const MEZO_PROJECT_TYPE = "Mezo Readiness Programme";

export function verifyMezoSignature(rawBody: string, signature: string | null, secret: string): boolean {
  if (!signature || !/^[0-9a-f]{64}$/i.test(signature)) return false;
  const expected = createHmac("sha256", secret).update(rawBody).digest();
  const given = Buffer.from(signature, "hex");
  return given.length === expected.length && timingSafeEqual(given, expected);
}

const days = z.object({ PRINCIPAL: z.number().optional(), SENIOR: z.number().optional(), CONSULTANT: z.number().optional() });

export const OpportunitySchema = z.object({
  externalRef: z.string().regex(/^MZF-[A-Z0-9]{6}$/),
  organizationName: z.string().min(1).max(200).nullable(),
  organizationType: z.string().max(40).nullable(),
  city: z.string().max(100).nullable(),
  state: z.string().max(60).nullable(),
  zone: z.string().max(120),
  contact: z.object({ name: z.string().max(120).nullable(), role: z.string().max(120).nullable(), email: z.string().max(200).nullable(), phone: z.string().max(40).nullable() }),
  size: z.object({ beds: z.number().nullable(), theatres: z.number().nullable(), consultingRooms: z.number().nullable() }),
  assessment: z.object({
    qualityLevel: z.number(),
    percent: z.number(),
    pathway: z.string(),
    readyNow: z.array(z.string()),
    blocked: z.array(z.string()),
    zoneEnquiries90d: z.number(),
  }),
  request: z.object({ requestedAt: z.string().nullable(), support: z.string().nullable(), areas: z.array(z.string()), note: z.string().nullable() }),
  workstreams: z.array(
    z.object({ id: z.string(), title: z.string(), serviceLine: z.string(), criticalGaps: z.array(z.string()), gapCount: z.number(), unlocks: z.array(z.string()), days })
  ),
  totalDays: z.number(),
  serviceLines: z.array(z.string()),
  managed: z.object({ candidate: z.boolean(), priority: z.string(), reason: z.string() }),
  mezoUrl: z.string().url(),
});
export type Opportunity = z.infer<typeof OpportunitySchema>;

const SERVICE_LINE_LABEL: Record<string, string> = {
  HOSPITAL_OPERATIONS: "Hospital Operations",
  CLINICAL_GOVERNANCE: "Clinical Governance",
  DIGITAL_HEALTH: "Digital Health",
};

const SUPPORT_LABEL: Record<string, string> = {
  SELF_SERVE: "will do it themselves",
  SUPPORTED: "wants to work through it with a team",
  MANAGED: "wants Mezo to run the facility",
};

/** The service lines to hook the lead to. A request for Mezo to run it is managed operations first. */
export function hooksFor(o: Opportunity): string[] {
  const hooks = o.serviceLines.map((s) => SERVICE_LINE_LABEL[s] ?? s);
  if (o.request.support === "MANAGED" || o.managed.candidate) hooks.unshift("Managed Hospital Operations");
  return [...new Set(hooks)];
}

/**
 * HOT when the owner asked for help or for Mezo to run the site; WARM when
 * they chose to do it themselves, or have not answered yet, but the site is a
 * managed prospect; COLD otherwise.
 */
export function scoreFor(o: Opportunity): "HOT" | "WARM" | "COLD" {
  if (o.request.support === "SUPPORTED" || o.request.support === "MANAGED") return "HOT";
  if (o.request.support === "SELF_SERVE" || o.managed.candidate) return "WARM";
  return "COLD";
}

export function sizeFor(o: Opportunity): "SMALL" | "MEDIUM" | "LARGE" {
  const beds = o.size.beds ?? 0;
  return beds >= 30 ? "LARGE" : beds >= 10 || (o.size.theatres ?? 0) >= 2 ? "MEDIUM" : "SMALL";
}

const dayLine = (d: z.infer<typeof days>) =>
  (["PRINCIPAL", "SENIOR", "CONSULTANT"] as const)
    .filter((g) => d[g])
    .map((g) => `${d[g]} ${g.toLowerCase()}`)
    .join(", ");

/** The lead's opening note: the reference first, so a resend finds the same lead. */
export function messageFor(o: Opportunity): string {
  const lines = [
    `Mezo ref ${o.externalRef}`,
    `${o.organizationName ?? "Facility"}, ${[o.city, o.state].filter(Boolean).join(", ")} (${o.zone}).`,
    `Assessed at quality level ${o.assessment.qualityLevel} of 5 (${o.assessment.percent}%). Ready now: ${o.assessment.readyNow.join(", ") || "nothing yet"}. Blocked: ${o.assessment.blocked.join(", ") || "none"}.`,
    `${o.assessment.zoneEnquiries90d} patient enquiries in its zone in 90 days.`,
    o.request.support ? `The owner ${SUPPORT_LABEL[o.request.support] ?? o.request.support}.${o.request.note ? ` They wrote: "${o.request.note}"` : ""}` : "Not yet asked for help.",
    o.managed.candidate ? `Managed prospect (${o.managed.priority.toLowerCase()} priority): ${o.managed.reason}` : "",
    "",
    `Work, about ${o.totalDays} consultant days in all:`,
    ...o.workstreams.map((w) => `- ${w.title}: ${w.gapCount} gaps (${w.criticalGaps.length} essential)${w.unlocks.length ? `, opens ${w.unlocks.join(", ")}` : ""}. ${dayLine(w.days)}.`),
    "",
    `Assessment in Mezo: ${o.mezoUrl}`,
  ];
  return lines.filter((l, i) => l !== "" || lines[i - 1] !== "").join("\n");
}

export function painPointsFor(o: Opportunity): string[] {
  return o.workstreams.flatMap((w) => w.criticalGaps).slice(0, 12);
}
