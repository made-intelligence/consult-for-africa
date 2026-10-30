/** Recruitment stages from which a member sees the Documents item in the portal nav. */
const DOCS_STAGES = ["SHORTLISTED", "INTERVIEW_SCHEDULED", "INTERVIEW_DONE", "OFFER", "PLACED"];

export function showsDocuments(recruitmentStage: string | null | undefined): boolean {
  return Boolean(recruitmentStage && DOCS_STAGES.includes(recruitmentStage));
}
