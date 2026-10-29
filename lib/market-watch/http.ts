/** Fetch with a timeout, so one slow provider cannot eat a cron's whole budget. */
export async function fetchWithTimeout(url: string, init: RequestInit = {}, ms = 20_000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), ms);
  try {
    return await fetch(url, { ...init, signal: ctrl.signal });
  } finally {
    clearTimeout(timer);
  }
}

/** JSON or a readable error. Providers often answer a throttle with plain text. */
export async function fetchJson<T>(url: string, init: RequestInit = {}, ms?: number): Promise<T> {
  const res = await fetchWithTimeout(url, init, ms);
  const body = await res.text();
  if (!res.ok) throw new Error(`${new URL(url).host} ${res.status}: ${body.slice(0, 200)}`);
  try {
    return JSON.parse(body) as T;
  } catch {
    throw new Error(`${new URL(url).host} returned non-JSON: ${body.slice(0, 200)}`);
  }
}

export const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Strip tags and collapse whitespace; enough for feeds and page diffs. */
export function htmlToText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<noscript[\s\S]*?<\/noscript>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/\s+/g, " ")
    .trim();
}

export function num(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : v;
  return typeof n === "number" && Number.isFinite(n) ? n : null;
}
