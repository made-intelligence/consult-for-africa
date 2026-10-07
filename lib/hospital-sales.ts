/**
 * Hospital sales: one directory of hospitals and one funnel per product.
 *
 * Every product in the suite is sold to the same hospitals, so the directory
 * (Hospital + HospitalContact) is shared and each product only adds a stage
 * per hospital (HospitalProductStage) and its own campaigns.
 *
 * Outbound email goes through ZeptoMail only and refuses to fall back to SMTP:
 * Zoho throttles batches and burns the domain. Every send carries a tracked
 * link and a one click opt out that writes CommunicationSuppression.
 */

import { randomBytes } from "node:crypto";

export type ProductKey = "claims-recovery";

export const PRODUCTS: Record<ProductKey, { label: string; path: string; live: boolean }> = {
  "claims-recovery": { label: "Claims Recovery", path: "/services/claims-recovery", live: true },
};

export const isProduct = (k: string): k is ProductKey => k in PRODUCTS;

/** The funnel, in order. LOST and NOT_FIT sit outside it. */
export const STAGES = [
  { key: "TARGET", label: "Target" },
  { key: "CONTACTED", label: "Contacted" },
  { key: "ENGAGED", label: "Clicked or replied" },
  { key: "ENQUIRED", label: "Enquired" },
  { key: "SAMPLE", label: "Sample review" },
  { key: "PROPOSAL", label: "Terms sent" },
  { key: "WON", label: "Signed" },
] as const;
export const CLOSED_STAGES = [
  { key: "LOST", label: "Lost" },
  { key: "NOT_FIT", label: "Not a fit" },
] as const;
export type StageKey = (typeof STAGES)[number]["key"] | (typeof CLOSED_STAGES)[number]["key"];
export const ALL_STAGES: readonly StageKey[] = [...STAGES, ...CLOSED_STAGES].map((s) => s.key);

const rank = (s: string) => STAGES.findIndex((x) => x.key === s);

/** Automatic moves only ever go forward, and never reopen a closed hospital. */
export function advances(current: string, next: StageKey): boolean {
  if (CLOSED_STAGES.some((c) => c.key === current)) return false;
  return rank(next) > rank(current);
}

export const newToken = () => randomBytes(18).toString("base64url");

/** Name + LGA with punctuation and filler removed, for re-import dedupe. */
export function importKey(name: string, area: string | null | undefined): string {
  const n = name
    .toLowerCase()
    .replace(/-/g, "")
    .replace(/[^a-z0-9 ]/g, " ")
    .replace(/\b(ltd|limited|the|nig|nigeria)\b/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  return `${n}|${(area ?? "").toLowerCase().trim()}`;
}

/** Nigerian numbers to +234 form. Returns null for anything unusable. */
export function normalisePhone(raw: string): string | null {
  const d = raw.replace(/[^\d+]/g, "");
  if (/^\+234\d{10}$/.test(d)) return d;
  if (/^234\d{10}$/.test(d)) return `+${d}`;
  if (/^0\d{10}$/.test(d)) return `+234${d.slice(1)}`;
  return null;
}

export function splitPhones(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [...new Set(String(raw).split(/[,;/]| or /i).map((p) => normalisePhone(p.trim())).filter((p): p is string => !!p))];
}

export function splitEmails(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return [
    ...new Set(
      String(raw)
        .split(/[,;\s/]+/)
        .map((e) => e.trim().toLowerCase().replace(/^mailto:/, ""))
        .filter((e) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/.test(e)),
    ),
  ];
}

/** A wa.me link with the opening message filled in, for manual WhatsApp follow up. */
export function whatsappLink(phone: string, text: string): string {
  return `https://wa.me/${phone.replace(/^\+/, "")}?text=${encodeURIComponent(text)}`;
}

const SITE = process.env.NEXTAUTH_URL?.replace(/\/$/, "") || "https://www.consultforafrica.com";
export const trackedUrl = (token: string) => `${SITE}/go/${token}`;
export const optOutUrl = (token: string) => `${SITE}/optout/${token}`;

function esc(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

/** {{greeting}} becomes "Dear <name>," or "Good day," when no name is on file. */
export function fill(template: string, v: { hospital: string; name: string | null }): string {
  const name = v.name?.trim();
  return template
    .replace(/\{\{\s*greeting\s*\}\}/g, name ? `Dear ${name},` : "Good day,")
    .replace(/\{\{\s*hospital\s*\}\}/g, v.hospital)
    .replace(/\{\{\s*name\s*\}\}/g, name || "colleague");
}

export const DEFAULT_CAMPAIGN = {
  name: "Claims recovery: first approach",
  subject: "Unpaid HMO claims at {{hospital}}",
  ctaText: "Check what {{hospital}} is owed",
  body: `{{greeting}}

Most private hospitals carry months of HMO and corporate billing that has not been paid. Very little of it is refused. Most of it is stuck on an authorisation code, a tariff mismatch or a missing document, and nobody has had the time to settle it.

Consult for Africa now does that work for hospitals. We check each unpaid claim, fix what can be fixed, and settle it with the HMO's claims team. We are paid from what we recover.

If you send us a list of 20 unpaid claims, with references and amounts only and no patient details, we will tell you within a week what is recoverable and from whom. There is no charge for that.

Dr Debo Odulana
Founding Partner, Consult for Africa`,
};

/** The WhatsApp opener for hospitals with a phone and no email. */
export const WHATSAPP_OPENER = (hospital: string) =>
  `Good day. This is Consult for Africa. We help private hospitals recover unpaid HMO and corporate claims, and we are paid from what we recover. If ${hospital} sends us 20 unpaid claims (references and amounts only), we will tell you within a week what is recoverable. Who would be the right person to speak to? https://www.consultforafrica.com/services/claims-recovery`;

/**
 * A plain letter, not a newsletter: no images and one link, because that is
 * what reaches a hospital administrator's inbox rather than the promotions tab.
 */
export function renderEmail(opts: {
  body: string;
  ctaText: string;
  token: string;
  hospital: string;
  name: string | null;
}): { html: string; text: string } {
  const text = fill(opts.body, opts);
  const paras = text.split(/\n{2,}/).map((p) => p.trim()).filter(Boolean);
  const link = trackedUrl(opts.token);
  const out = optOutUrl(opts.token);
  const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:24px 16px;background:#ffffff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;color:#1f2937;">
<div style="max-width:560px;margin:0 auto;font-size:15px;line-height:1.6;">
${paras.map((p) => `<p style="margin:0 0 14px;">${esc(p).replace(/\n/g, "<br>")}</p>`).join("\n")}
<p style="margin:18px 0 22px;"><a href="${esc(link)}" style="color:#0B3C5D;font-weight:600;">${esc(fill(opts.ctaText, opts))}</a></p>
<p style="margin:28px 0 0;font-size:12px;color:#6b7280;border-top:1px solid #e5e7eb;padding-top:12px;">Consult for Africa, Lagos and Abuja. You are receiving this because ${esc(opts.hospital)} is listed as a healthcare provider in Nigeria. <a href="${esc(out)}" style="color:#6b7280;">Stop these emails</a>.</p>
</div></body></html>`;
  const plain = `${text}\n\n${fill(opts.ctaText, opts)}: ${link}\n\n--\nConsult for Africa, Lagos and Abuja.\nStop these emails: ${out}`;
  return { html, text: plain };
}
