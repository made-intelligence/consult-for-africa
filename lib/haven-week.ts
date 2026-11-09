/**
 * This week's plan for the founders' Monday note. Updated by CFA each week
 * (the note falls back to the six-month plan when the week here is stale).
 */
export interface WeekItem { what: string; who: string; by: string }

export const THIS_WEEK: { weekOf: string; items: WeekItem[] } = {
  weekOf: "2026-11-09",
  items: [
    { what: "November rotas entered on the staff page", who: "Chioma, Dr Shakirah, Benedict", by: "Mon 9" },
    { what: "Six core training modules approved, then the rest", who: "Dr Odedina", by: "Wed 11" },
    { what: "Personal objectives agreed for all 23 staff", who: "Line managers", by: "Fri 13" },
    { what: "Version 2 of the OKRs and job descriptions", who: "Dr Tanwa", by: "Fri 13" },
    { what: "HR company details and contract review status", who: "Dr Tanwa and Abigail", by: "Mon 9" },
    { what: "Quick tariff fixes closed; drugs priced by rule", who: "Benedict and Moshood", by: "Fri 13" },
    { what: "Vendor-managed inventory with Medbury Pharmaceuticals: formulary shared, consignment terms and first stock list agreed", who: "CFA with the pharmacy team", by: "Fri 13" },
    { what: "Daily team huddles recorded", who: "Team leads", by: "Daily" },
  ],
};
