/**
 * WhatsApp and SMS through Termii, the channel Mezo already sends on.
 *
 * Termii reaches individual numbers only. It cannot post into a WhatsApp
 * group, so anything meant for a group is sent to a person who forwards it.
 *
 * Needs TERMII_API_KEY and TERMII_SENDER_ID (the Mezo values) in the env.
 */

const TERMII_BASE = "https://api.ng.termii.com/api";

/** Nigerian numbers to 234XXXXXXXXXX. */
export function normalisePhone(phone: string): string {
  let n = phone.replace(/[^0-9]/g, "");
  if (n.startsWith("0") && n.length === 11) n = `234${n.slice(1)}`;
  if (n.length === 10) n = `234${n}`;
  return n;
}

export async function sendWhatsApp(to: string, message: string): Promise<{ ok: boolean; id?: string; error?: string }> {
  const apiKey = process.env.TERMII_API_KEY;
  if (!apiKey) return { ok: false, error: "TERMII_API_KEY not set" };
  try {
    const res = await fetch(`${TERMII_BASE}/sms/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        to: normalisePhone(to),
        from: process.env.TERMII_SENDER_ID ?? "MezoHealth",
        sms: message,
        type: "plain",
        channel: "whatsapp",
        api_key: apiKey,
      }),
    });
    const data: { message_id?: string; message?: string; code?: string } | null = await res.json().catch(() => null);
    if (!res.ok || (data?.code && data.code !== "ok")) return { ok: false, error: data?.message ?? `HTTP ${res.status}` };
    return { ok: true, id: data?.message_id };
  } catch (err) {
    return { ok: false, error: String(err) };
  }
}
