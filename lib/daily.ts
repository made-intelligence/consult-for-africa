/**
 * Daily.co rooms for C4A meetings.
 *
 * Rooms live on the Daily domain Mezo already runs teleconsults on, so the key
 * and domain are the same DAILY_API_KEY / DAILY_DOMAIN. Every C4A room is named
 * cfa-<meetingId>, which keeps them apart from Mezo's mezo-<bookingRef> rooms
 * and lets the transcript sweep ask Daily for one room at a time.
 *
 * Daily transcribes the call itself. Transcription starts automatically when
 * somebody holding an owner token joins, so every C4A person on the invite gets
 * an owner link and clients get guest links. Nobody has to remember to press a
 * button, and nothing has to join the call to take notes.
 */

const DAILY_BASE_URL = "https://api.daily.co/v1";

/** Doors open this long before the scheduled start. */
const OPEN_BEFORE_MS = 30 * 60 * 1000;
/** And close this long after the scheduled end, because meetings overrun. */
const CLOSE_AFTER_MS = 3 * 60 * 60 * 1000;

function apiKey(): string | undefined {
  return process.env.DAILY_API_KEY;
}

export function isDailyConfigured(): boolean {
  return Boolean(apiKey() && process.env.DAILY_DOMAIN);
}

async function daily<T>(path: string, init: RequestInit = {}): Promise<T> {
  const key = apiKey();
  if (!key) throw new Error("Daily is not configured (DAILY_API_KEY missing)");
  const res = await fetch(`${DAILY_BASE_URL}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json", ...init.headers },
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const detail = (body as { info?: string; error?: string }).info ?? (body as { error?: string }).error;
    throw new Error(`Daily ${init.method ?? "GET"} ${path} returned ${res.status}${detail ? `: ${detail}` : ""}`);
  }
  return res.json() as Promise<T>;
}

export function roomNameFor(meetingId: string): string {
  return `cfa-${meetingId}`.toLowerCase().replace(/[^a-z0-9-]/g, "-");
}

export function roomUrlFor(roomName: string): string {
  return `https://${process.env.DAILY_DOMAIN}.daily.co/${roomName}`;
}

function windowFor(startsAt: Date, endsAt: Date) {
  return {
    nbf: Math.floor((startsAt.getTime() - OPEN_BEFORE_MS) / 1000),
    exp: Math.floor((endsAt.getTime() + CLOSE_AFTER_MS) / 1000),
  };
}

/**
 * Create the private room for a meeting. Transcripts are stored, so the sweep
 * can collect them after the call; without storage Daily only broadcasts them
 * live and they are gone when the last person leaves.
 */
export async function createMeetingRoom(params: {
  meetingId: string;
  startsAt: Date;
  endsAt: Date;
}): Promise<{ roomName: string; roomUrl: string }> {
  const roomName = roomNameFor(params.meetingId);
  await daily("/rooms", {
    method: "POST",
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: {
        ...windowFor(params.startsAt, params.endsAt),
        enable_prejoin_ui: true,
        enable_knocking: true,
        enable_screenshare: true,
        enable_chat: true,
        eject_at_room_exp: true,
        enable_transcription_storage: true,
        auto_transcription_settings: { language: "en" },
      },
    }),
  });
  return { roomName, roomUrl: roomUrlFor(roomName) };
}

/** Move the room's opening window when the meeting is rescheduled. */
export async function rescheduleMeetingRoom(roomName: string, startsAt: Date, endsAt: Date): Promise<void> {
  await daily(`/rooms/${roomName}`, {
    method: "POST",
    body: JSON.stringify({ properties: windowFor(startsAt, endsAt) }),
  });
}

export async function deleteMeetingRoom(roomName: string): Promise<void> {
  await daily(`/rooms/${roomName}`, { method: "DELETE" });
}

/**
 * A personal link into the room. C4A people join as owners, which is what
 * starts transcription and lets them admit anyone knocking. Clients join as
 * guests. The token carries no expiry of its own: the room's window is the
 * gate, so a rescheduled meeting does not need every link sent again.
 */
export async function joinLinkFor(params: {
  roomName: string;
  userName: string;
  isOwner: boolean;
}): Promise<string> {
  const { token } = await daily<{ token: string }>("/meeting-tokens", {
    method: "POST",
    body: JSON.stringify({
      properties: {
        room_name: params.roomName,
        user_name: params.userName,
        is_owner: params.isOwner,
        ...(params.isOwner ? { auto_start_transcription: true } : {}),
      },
    }),
  });
  return `${roomUrlFor(params.roomName)}?t=${token}`;
}

// ─── Transcripts ─────────────────────────────────────────────────────────────

export interface DailyTranscript {
  transcriptId: string;
  mtgSessionId: string;
  status: "t_finished" | "t_in_progress" | "t_error" | "t_deleted";
  isVttAvailable: boolean;
  duration: number;
  created_at: string;
}

export async function listTranscripts(roomName: string): Promise<DailyTranscript[]> {
  const { data } = await daily<{ data: DailyTranscript[] }>(
    `/transcript?room_name=${encodeURIComponent(roomName)}&limit=50`,
  );
  return data ?? [];
}

/** Anyone still in the room? A transcript is not final while they are. */
export async function roomIsOccupied(roomName: string): Promise<boolean> {
  const { total_count } = await daily<{ total_count: number }>(`/rooms/${roomName}/presence`);
  return total_count > 0;
}

export async function downloadTranscript(transcriptId: string): Promise<string> {
  // The reference names the field `link` and its own example shows
  // `download_link`, so accept either rather than find out in production.
  const res = await daily<{ link?: string; download_link?: string }>(`/transcript/${transcriptId}/access-link`);
  const url = res.link ?? res.download_link;
  if (!url) throw new Error(`Daily gave no download link for transcript ${transcriptId}`);
  const file = await fetch(url);
  if (!file.ok) throw new Error(`Transcript ${transcriptId} download returned ${file.status}`);
  return file.text();
}

/**
 * WebVTT to plain "Speaker: words" lines.
 *
 * Daily's documentation does not say how it marks the speaker, so this takes a
 * `<v Name>` voice tag or a leading "Name:" if either is present and otherwise
 * keeps the words alone. Consecutive cues from one speaker are joined, because
 * Daily cuts a cue every few seconds and a sentence split over four lines reads
 * as four people.
 */
export function vttToText(vtt: string): string {
  const lines: { speaker: string | null; text: string }[] = [];
  for (const block of vtt.replace(/\r/g, "").split(/\n\n+/)) {
    const rows = block.split("\n").filter(Boolean);
    const timing = rows.findIndex((r) => r.includes("-->"));
    if (timing === -1) continue;
    const raw = rows.slice(timing + 1).join(" ").trim();
    if (!raw) continue;

    let speaker: string | null = null;
    let text = raw;
    const voice = raw.match(/^<v(?:\.[^\s>]+)?\s+([^>]+)>([\s\S]*?)(?:<\/v>)?$/);
    if (voice) {
      speaker = voice[1].trim();
      text = voice[2];
    }
    text = text.replace(/<[^>]+>/g, "").trim();
    if (!speaker) {
      const named = text.match(/^([A-Z][\w .'-]{0,40}):\s+(.+)$/);
      if (named) {
        speaker = named[1].trim();
        text = named[2];
      }
    }
    if (!text) continue;

    const last = lines[lines.length - 1];
    if (last && last.speaker === speaker) last.text += ` ${text}`;
    else lines.push({ speaker, text });
  }
  return lines.map((l) => (l.speaker ? `${l.speaker}: ${l.text}` : l.text)).join("\n");
}
