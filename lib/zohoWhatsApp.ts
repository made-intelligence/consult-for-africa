/**
 * WhatsApp through Mezo's Zoho CPaaS sender (+1 555 368 9355, "MezoHealth").
 *
 * Template-only: WhatsApp lets a business open a conversation only with a
 * Meta-approved template, and a template variable cannot carry a line break.
 * So a long message goes out as a short template with a link, and the link
 * holds the text.
 *
 * Env: ZOHO_CPAAS_TOKEN (the Mezo agent's send key), ZOHO_CPAAS_WHATSAPP_FROM.
 */

const URL_WA = process.env.ZOHO_CPAAS_WHATSAPP_URL ?? "https://cpaas.zoho.com/v1.1/whatsapp";

export function normalisePhone(phone: string): string {
  let n = phone.replace(/[^0-9]/g, "");
  if (n.startsWith("0") && n.length === 11) n = `234${n.slice(1)}`;
  return `+${n}`;
}

export async function sendWhatsAppTemplate(
  to: string,
  templateAlias: string,
  mergeInfo: Record<string, string>,
): Promise<{ ok: boolean; error?: string }> {
  const token = process.env.ZOHO_CPAAS_TOKEN;
  const from = process.env.ZOHO_CPAAS_WHATSAPP_FROM;
  if (!token || !from) return { ok: false, error: "ZOHO_CPAAS_TOKEN or ZOHO_CPAAS_WHATSAPP_FROM not set" };
  try {
    const res = await fetch(URL_WA, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token.startsWith("Zoho-enczapikey") ? token : `Zoho-enczapikey ${token}`,
      },
      body: JSON.stringify({ from, to: normalisePhone(to), template_alias: templateAlias, merge_info: mergeInfo }),
    });
    const d: { status?: string; error?: unknown } | null = await res.json().catch(() => null);
    if (d?.status === "success") return { ok: true };
    return { ok: false, error: JSON.stringify(d?.error ?? d ?? res.status).slice(0, 300) };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
