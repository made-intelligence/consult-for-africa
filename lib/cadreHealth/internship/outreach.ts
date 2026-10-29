// ─── CadreHealth: Nurse internship placement, emails to centres ───
//
// Pure: the composer renders its preview with these functions and the send
// route renders the real thing with the same ones, so what the sender sees is
// what the centre gets.

import { INTAKE_LABEL } from "./programme";
import { QUESTION_COUNT } from "./paper";

/** The programme lead, named on the public pages and signed into presets. */
export const PROGRAMME_LEAD = { name: "Favour Aina", role: "Programme lead, nurse internship placement" };

/** Public inbox for the programme. Replies to centre emails land here. */
export const PROGRAMME_EMAIL = "hello@consultforafrica.com";

/** The merge fields a template may use, with what each one means. */
export const MERGE_FIELDS: { key: string; meaning: string }[] = [
  { key: "greeting", meaning: "Dear + the contact's name, or Dear Head of Nursing" },
  { key: "centreName", meaning: "The centre's name" },
  { key: "choices", meaning: "How many applicants chose this centre" },
  { key: "applicants", meaning: "Applicants in this intake, all centres" },
  { key: "centres", meaning: "Approved centres on the list" },
  { key: "intake", meaning: INTAKE_LABEL },
  { key: "centresPage", meaning: "Link to the page for centres" },
  { key: "senderName", meaning: "Your name" },
  { key: "senderRole", meaning: "Your role on the programme" },
];

export interface OutreachVars {
  greeting: string;
  centreName: string;
  choices: string;
  applicants: string;
  centres: string;
  intake: string;
  centresPage: string;
  senderName: string;
  senderRole: string;
}

export interface Preset {
  key: string;
  label: string;
  /** When to use it, shown to the sender. */
  when: string;
  subject: string;
  body: string;
  /** Leave out centres nobody has chosen yet: the email only works with a number in it. */
  needsChoices?: boolean;
}

export const PRESETS: Preset[] = [
  {
    key: "intro",
    label: "First approach",
    when: "A centre we have not written to before.",
    subject: "A ranked shortlist of assessed BNSc interns for {{centreName}}",
    body: `{{greeting}},

{{centreName}} is on the NMCN list of approved internship centres in Lagos. I am writing because CadreHealth now runs one application and one assessment for BNSc graduates seeking an internship place, and we would like {{centreName}} to take part in the {{intake}}.

Graduates apply once, rank up to five centres, and sit a ${QUESTION_COUNT}-question assessment covering fundamentals, drug calculations, maternal and child health, infection prevention, ethics and emergency care. Each centre receives a ranked list of the people who chose it and reached the centre's own minimum score. You still interview and decide.

It replaces your own written exam and the pile of unscreened applications, and it costs the centre nothing for the {{intake}}.

The details are here: {{centresPage}}

Could we have 20 minutes with you or your Head of Nursing in the next fortnight?

Kind regards,
{{senderName}}
{{senderRole}}
CadreHealth, Consult For Africa`,
  },
  {
    key: "demand",
    label: "Demand update",
    when: "Once applicants have chosen the centre. The number is the strongest thing we can say.",
    needsChoices: true,
    subject: "{{choices}} BNSc graduates have chosen {{centreName}} for their internship",
    body: `{{greeting}},

{{choices}} BNSc graduates applying for the {{intake}} have ranked {{centreName}} among their choices of internship centre.

When {{centreName}} joins, you receive their assessment results as a ranked list, filtered by the minimum score you set, with section scores for each candidate. You invite the ones you want to interview from your CadreHealth login, and we tell the candidates.

To start receiving the list we need three things: how many places you have, the minimum score you want, and the name of the person who will review candidates.

The details are here: {{centresPage}}

Kind regards,
{{senderName}}
{{senderRole}}
CadreHealth, Consult For Africa`,
  },
  {
    key: "followup",
    label: "Follow-up",
    when: "A week after a first approach with no reply.",
    subject: "Following up: internship shortlist for {{centreName}}",
    body: `{{greeting}},

I wrote recently about the shared internship application for BNSc graduates in Lagos. {{applicants}} graduates have applied for the {{intake}} so far.

If it would help, I can come to {{centreName}} and take your Head of Nursing through it in 20 minutes. If someone else handles intern recruitment, I would be grateful for their name.

{{centresPage}}

Kind regards,
{{senderName}}
{{senderRole}}
CadreHealth, Consult For Africa`,
  },
  {
    key: "commit",
    label: "Confirm terms",
    when: "After a centre has said yes in a meeting.",
    subject: "Confirming {{centreName}} for the {{intake}}",
    body: `{{greeting}},

Thank you for agreeing to take {{centreName}}'s interns for the {{intake}} through CadreHealth.

To open your list, please confirm:
1. The number of internship places for this intake
2. The minimum assessment score you want candidates to reach
3. When your intake starts
4. The name and email of the person who will review candidates. We will send them a CadreHealth login.

Candidates appear on your list as they finish the assessment. You invite, offer or decline from the list, and we tell each candidate.

Kind regards,
{{senderName}}
{{senderRole}}
CadreHealth, Consult For Africa`,
  },
];

/** "Dear Matron Adeyemi", or the role when we have no name yet. */
export function greetingFor(contactName: string | null | undefined): string {
  const n = contactName?.trim();
  return n ? `Dear ${n}` : "Dear Head of Nursing";
}

/** Substitute {{field}} placeholders. Unknown fields are left as typed so the sender sees the mistake. */
export function renderText(template: string, vars: OutreachVars): string {
  return template.replace(/\{\{\s*(\w+)\s*\}\}/g, (whole, key: string) =>
    key in vars ? vars[key as keyof OutreachVars] : whole,
  );
}

/** Fields typed in the template that are not merge fields. */
export function unknownFields(template: string): string[] {
  const known = new Set(MERGE_FIELDS.map((f) => f.key));
  return [...new Set([...template.matchAll(/\{\{\s*(\w+)\s*\}\}/g)].map((m) => m[1]).filter((k) => !known.has(k)))];
}

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

/** Plain text, blank-line paragraphs, into the email HTML. Links are made clickable. */
export function toHtml(text: string): string {
  const paras = text.trim().split(/\n\s*\n/);
  const body = paras
    .map((p) => {
      const html = esc(p)
        .replace(/https?:\/\/[^\s<]+/g, (u) => `<a href="${u}" style="color:#0B3C5D">${u}</a>`)
        .replace(/\n/g, "<br/>");
      return `<p style="margin:0 0 14px">${html}</p>`;
    })
    .join("\n");
  return `<div style="font-family:Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#1f2937;max-width:600px">\n${body}\n</div>`;
}

// ─── Contact import ───

export interface ContactRow {
  centre: string;
  contactName?: string;
  contactRole?: string;
  contactEmail?: string;
  contactPhone?: string;
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Split one CSV line, honouring double quotes. */
function splitLine(line: string, sep: string): string[] {
  const out: string[] = [];
  let cur = "";
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"';
        i++;
      } else q = !q;
    } else if (ch === sep && !q) {
      out.push(cur.trim());
      cur = "";
    } else cur += ch;
  }
  out.push(cur.trim());
  return out;
}

/**
 * Rows pasted from a spreadsheet: centre, contact name, role, email, phone.
 * Tabs (a paste from Sheets or Excel) or commas. A header row is skipped. The
 * columns can be in any order when the header names them.
 */
export function parseContacts(input: string): ContactRow[] {
  const lines = input.split(/\r?\n/).filter((l) => l.trim());
  if (!lines.length) return [];
  const sep = lines[0].includes("\t") ? "\t" : ",";
  let cols = ["centre", "contactName", "contactRole", "contactEmail", "contactPhone"];
  const head = splitLine(lines[0], sep).map((h) => h.toLowerCase());
  const isHeader = head.some((h) => /centre|center|hospital|email/.test(h)) && !head.some((h) => EMAIL.test(h));
  if (isHeader) {
    cols = head.map((h) =>
      /centre|center|hospital|facility/.test(h) ? "centre"
      : /mail/.test(h) ? "contactEmail"
      : /phone|tel|mobile|whatsapp/.test(h) ? "contactPhone"
      : /role|title|position|designation/.test(h) ? "contactRole"
      : /name|contact/.test(h) ? "contactName"
      : "",
    );
  }
  return lines.slice(isHeader ? 1 : 0).flatMap((line) => {
    const cells = splitLine(line, sep);
    const row: Record<string, string> = {};
    cols.forEach((c, i) => {
      if (c && cells[i]) row[c] = cells[i];
    });
    if (!row.centre) return [];
    // An email typed in the wrong column is still an email.
    if (!row.contactEmail) {
      const found = cells.find((c) => EMAIL.test(c));
      if (found) row.contactEmail = found;
    }
    if (row.contactEmail) row.contactEmail = row.contactEmail.toLowerCase();
    return [row as unknown as ContactRow];
  });
}

export function isEmail(s: string | undefined): boolean {
  return !!s && EMAIL.test(s);
}

const STOP = new Set(["the", "hospital", "hospitals", "and", "of", "lagos", "clinic", "clinics", "centre", "center", "ltd", "limited", "nigeria", "headquarters"]);

function tokens(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9 ]+/g, " ").split(/\s+/).filter((t) => t && !STOP.has(t));
}

/**
 * The centre a typed name means, or null when it is unclear. Exact match on the
 * words that carry the name ("Eko" for "The Eko Hospital"), then the best word
 * overlap, refused when two centres tie.
 */
export function matchCentre<T extends { id: string; name: string }>(typed: string, centres: T[]): T | null {
  const want = tokens(typed);
  if (!want.length) return null;
  const key = want.join(" ");
  const exact = centres.filter((c) => tokens(c.name).join(" ") === key);
  if (exact.length === 1) return exact[0];
  let best: T | null = null;
  let bestScore = 0;
  let tie = false;
  for (const c of centres) {
    const have = new Set(tokens(c.name));
    const hit = want.filter((t) => have.has(t)).length;
    const score = hit / Math.max(want.length, have.size);
    if (score > bestScore) {
      best = c;
      bestScore = score;
      tie = false;
    } else if (score === bestScore && score > 0) tie = true;
  }
  return bestScore > 0.5 && !tie ? best : null;
}
