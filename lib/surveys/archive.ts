/**
 * Reading the archive.
 *
 * Three tables hold survey responses and none of them can be merged without a
 * migration that would be wrong: the Mezo rows carry provisioning state and a
 * foreign key to the professional, and the medipark rows keep contact details
 * in their own columns on purpose so an erasure request does not take the
 * research with it. So instead of collapsing the stores, this reads all three
 * into one shape.
 *
 * Everything that reads responses goes through here: the index, the detail
 * page, the export and the erasure. Adding a fourth store means adding an
 * adapter here and nothing else.
 */

import { prisma } from "@/lib/prisma";
import { surnameFor } from "@/lib/cadreSalutation";
import {
  SURVEYS,
  slugsForSource,
  surveyBySlug,
  questionsNotAskedAt,
  retiredOptions,
  type SurveyDefinition,
} from "./registry";

export interface ArchivedResponse {
  id: string;
  slug: string;
  createdAt: Date;
  /** Question id to answer, as submitted. */
  answers: Record<string, unknown>;
  /** Who answered, where the survey names them. Null on anonymous surveys. */
  respondent: string | null;
  /** Extra identifying context, such as a specialty or a city. */
  respondentDetail: string | null;
  /** Opt-in contact details. Null where none were given or none are kept. */
  contact: { name?: string | null; email?: string | null; phone?: string | null } | null;
  engagementId: string | null;
  /** Source-specific state worth showing, such as Mezo provisioning. */
  status: string | null;
  /**
   * Questions this response predates, because the instrument gained them after
   * it was submitted. An empty answer here means "never asked", which is not
   * the same as "declined to answer" and must never be counted as one.
   */
  notAsked: string[];
  /** True where an answer uses an option the instrument no longer offers. */
  usesRetiredOption: boolean;
}

export interface SurveyTotals {
  count: number;
  first: Date | null;
  last: Date | null;
}

// ---------------------------------------------------------------------------
// Counts. Three grouped queries rather than one per survey, so the index page
// costs the same whether the registry holds seventeen surveys or seventy.
// ---------------------------------------------------------------------------

export async function surveyTotals(): Promise<Map<string, SurveyTotals>> {
  const out = new Map<string, SurveyTotals>();
  for (const s of SURVEYS) out.set(s.slug, { count: 0, first: null, last: null });

  const [audit, medipark, mezo] = await Promise.all([
    prisma.auditSurveyResponse.groupBy({
      by: ["survey"],
      _count: true,
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
    prisma.mediparkSurveyResponse.groupBy({
      by: ["survey"],
      _count: true,
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
    prisma.cadreMezoInterest.aggregate({
      _count: true,
      _min: { createdAt: true },
      _max: { createdAt: true },
    }),
  ]);

  for (const row of [...audit, ...medipark]) {
    out.set(row.survey, {
      count: row._count,
      first: row._min.createdAt ?? null,
      last: row._max.createdAt ?? null,
    });
  }
  out.set("mezo-private-practice", {
    count: mezo._count,
    first: mezo._min.createdAt ?? null,
    last: mezo._max.createdAt ?? null,
  });

  return out;
}

// ---------------------------------------------------------------------------
// Responses.
// ---------------------------------------------------------------------------

export async function loadSurvey(slug: string): Promise<ArchivedResponse[]> {
  const survey = surveyBySlug(slug);
  if (!survey) return [];

  switch (survey.source) {
    case "audit":
      return loadAudit(survey);
    case "medipark":
      return loadMedipark(survey);
    case "mezo":
      return loadMezo(survey);
  }
}

/** Marks a row against the instrument's history. Shared by all three adapters. */
function annotate(
  survey: SurveyDefinition,
  createdAt: Date,
  answers: Record<string, unknown>,
): Pick<ArchivedResponse, "notAsked" | "usesRetiredOption"> {
  const retired = retiredOptions(survey);
  return {
    notAsked: questionsNotAskedAt(survey, createdAt),
    usesRetiredOption:
      retired.length > 0 &&
      Object.values(answers).some((v) => typeof v === "string" && retired.includes(v)),
  };
}

async function loadAudit(survey: SurveyDefinition): Promise<ArchivedResponse[]> {
  const rows = await prisma.auditSurveyResponse.findMany({
    where: { survey: survey.slug },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => {
    const answers = (r.payload ?? {}) as Record<string, unknown>;
    const named = survey.anonymous
      ? null
      : (survey.piiKeys ?? [])
          .map((k) => answers[k])
          .find((v): v is string => typeof v === "string" && v.trim().length > 0) ?? null;
    return {
      id: r.id,
      slug: survey.slug,
      createdAt: r.createdAt,
      answers,
      respondent: named,
      respondentDetail: null,
      contact: null,
      engagementId: r.engagementId,
      status: null,
      ...annotate(survey, r.createdAt, answers),
    };
  });
}

async function loadMedipark(survey: SurveyDefinition): Promise<ArchivedResponse[]> {
  const rows = await prisma.mediparkSurveyResponse.findMany({
    where: { survey: survey.slug },
    orderBy: { createdAt: "desc" },
  });
  return rows.map((r) => {
    const answers = (r.payload ?? {}) as Record<string, unknown>;
    // Contact details exist only where Q16 opted in. "findings" means send
    // results, not a pitch, so the distinction is kept rather than flattened.
    const wants = r.contactChoice === "contact" || r.contactChoice === "findings";
    return {
      id: r.id,
      slug: survey.slug,
      createdAt: r.createdAt,
      answers,
      respondent: wants ? r.name : null,
      respondentDetail: r.specialty,
      contact: wants ? { name: r.name, email: r.email, phone: r.phone } : null,
      engagementId: survey.engagementId,
      status: r.contactChoice,
      ...annotate(survey, r.createdAt, answers),
    };
  });
}

async function loadMezo(survey: SurveyDefinition): Promise<ArchivedResponse[]> {
  const rows = await prisma.cadreMezoInterest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      professional: {
        select: {
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          subSpecialty: true,
          state: true,
        },
      },
    },
  });
  return rows.map((r) => {
    const answers = (r.payload ?? {}) as Record<string, unknown>;
    const p = r.professional;
    // The register import put titles in firstName and middle names in lastName,
    // so a raw concatenation misnames a quarter of them.
    const surname = surnameFor(p.lastName) ?? p.lastName;
    return {
      id: r.id,
      slug: survey.slug,
      createdAt: r.createdAt,
      answers,
      respondent: `Dr ${surname}`.trim(),
      respondentDetail: p.subSpecialty,
      contact: { name: `Dr ${surname}`.trim(), email: p.email, phone: p.phone },
      engagementId: survey.engagementId,
      status: r.mezoStatus,
      ...annotate(survey, r.createdAt, answers),
    };
  });
}

// ---------------------------------------------------------------------------
// Distributions. Generic, because the registry does not hold question wording
// and does not need to: an answer's own value is a usable label, and the
// per-survey libs supply better ones where a reader wants them.
// ---------------------------------------------------------------------------

export interface Distribution {
  question: string;
  /** Responses that were actually asked this question. */
  base: number;
  /** Responses that predate the question entirely. */
  notAsked: number;
  values: { value: string; count: number }[];
}

export function distributions(rows: ArchivedResponse[]): Distribution[] {
  const questions = new Set<string>();
  for (const r of rows) {
    for (const k of Object.keys(r.answers)) questions.add(k);
    for (const k of r.notAsked) questions.add(k);
  }

  const out: Distribution[] = [];
  for (const q of questions) {
    const counts = new Map<string, number>();
    let base = 0;
    let notAsked = 0;
    for (const r of rows) {
      if (r.notAsked.includes(q)) {
        notAsked += 1;
        continue;
      }
      const v = r.answers[q];
      if (v === undefined || v === null || v === "") continue;
      base += 1;
      // Free text is not a distribution. Long answers are read, not counted.
      if (typeof v === "string" && v.length > 80) continue;
      const values = Array.isArray(v) ? v : [v];
      for (const one of values) {
        const key = String(one);
        counts.set(key, (counts.get(key) ?? 0) + 1);
      }
    }
    if (counts.size === 0) continue;
    out.push({
      question: q,
      base,
      notAsked,
      values: [...counts.entries()]
        .map(([value, count]) => ({ value, count }))
        .sort((a, b) => b.count - a.count),
    });
  }
  return out.sort((a, b) => b.base - a.base);
}

// ---------------------------------------------------------------------------
// Export.
// ---------------------------------------------------------------------------

function csvCell(v: unknown): string {
  if (v === null || v === undefined) return "";
  const s = Array.isArray(v) ? v.join("; ") : String(v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * One row per response, one column per question ever asked.
 *
 * A question a response predates is written as "(not asked)" rather than left
 * blank, so a spreadsheet cannot silently read it as a refusal. That
 * distinction is the whole reason the registry records instrument changes.
 */
export function toCsv(rows: ArchivedResponse[], includeContact: boolean): string {
  const questions = [
    ...new Set(rows.flatMap((r) => [...Object.keys(r.answers), ...r.notAsked])),
  ].sort();

  const header = ["id", "submitted_at", "respondent", "detail", "status", ...questions];
  if (includeContact) header.push("contact_name", "contact_email", "contact_phone");

  const lines = [header.map(csvCell).join(",")];
  for (const r of rows) {
    const cells: unknown[] = [
      r.id,
      r.createdAt.toISOString(),
      r.respondent,
      r.respondentDetail,
      r.status,
      ...questions.map((q) => (r.notAsked.includes(q) ? "(not asked)" : r.answers[q])),
    ];
    if (includeContact) {
      cells.push(r.contact?.name ?? "", r.contact?.email ?? "", r.contact?.phone ?? "");
    }
    lines.push(cells.map(csvCell).join(","));
  }
  return lines.join("\n");
}

export function toJson(rows: ArchivedResponse[], includeContact: boolean): string {
  return JSON.stringify(
    rows.map((r) => ({
      id: r.id,
      submittedAt: r.createdAt.toISOString(),
      respondent: r.respondent,
      detail: r.respondentDetail,
      status: r.status,
      answers: r.answers,
      notAsked: r.notAsked,
      usesRetiredOption: r.usesRetiredOption,
      ...(includeContact ? { contact: r.contact } : {}),
    })),
    null,
    2,
  );
}

/** Registry slugs that have never been stored, so a reader can say so plainly. */
export function allSlugs(): string[] {
  return [...slugsForSource("audit"), ...slugsForSource("medipark"), ...slugsForSource("mezo")];
}
