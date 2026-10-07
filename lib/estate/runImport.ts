import * as XLSX from "xlsx";

/**
 * Reading a week of generator hours out of somebody's spreadsheet.
 *
 * The live buttons only capture what a guard was present to press. Most history
 * arrives the other way: a supervisor with the gatehouse book, or a sheet that
 * has been passed around on WhatsApp and opened in three different apps. So this
 * parser is deliberately forgiving about shape and completely unforgiving about
 * ambiguity — it will find the columns whatever they are called, and it will
 * refuse a row it cannot read rather than guess at an hour that turns into money.
 *
 * Nothing here writes. It produces candidates for a preview, and a human
 * confirms them.
 */

export interface ParsedRun {
  /** 1-indexed, as the spreadsheet shows it, so an error can be pointed at. */
  row: number;
  startedAt: Date;
  endedAt: Date;
  minutes: number;
  /** Set only when the sheet names a building per row. */
  buildingHint: string | null;
  /** True when the off time was before the on time and a day was added. */
  crossedMidnight: boolean;
}

export interface RowError {
  row: number;
  reason: string;
}

export interface ParseResult {
  runs: ParsedRun[];
  errors: RowError[];
  /** What the parser decided each column was, so a human can sanity-check it. */
  columns: { date: string | null; on: string | null; off: string | null; building: string | null };
}

const DATE_HEADERS = ["date", "day", "dated"];
const ON_HEADERS = ["on", "timeon", "starttime", "start", "switchedon", "poweron", "from", "ontime"];
const OFF_HEADERS = ["off", "timeoff", "stoptime", "stop", "switchedoff", "poweroff", "to", "offtime", "end", "endtime"];
const BUILDING_HEADERS = ["building", "house", "site", "location", "block"];

function normalise(header: string): string {
  return header.toLowerCase().replace(/[^a-z0-9]/g, "");
}

function findColumn(headers: string[], candidates: string[]): string | null {
  // Exact match first. "on" must not be won by "location" simply because
  // "location" contains it, which is exactly what a contains-first search does.
  for (const c of candidates) {
    const hit = headers.find((h) => normalise(h) === c);
    if (hit) return hit;
  }
  for (const c of candidates) {
    const hit = headers.find((h) => normalise(h).includes(c));
    if (hit) return hit;
  }
  return null;
}

export function parseRunSheet(buffer: ArrayBuffer | Buffer): ParseResult {
  const book = XLSX.read(buffer, { cellDates: true });
  const sheet = book.Sheets[book.SheetNames[0]];
  if (!sheet) {
    return { runs: [], errors: [{ row: 0, reason: "That file has no sheets in it." }], columns: empty() };
  }

  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
  if (rows.length === 0) {
    return { runs: [], errors: [{ row: 0, reason: "That sheet is empty." }], columns: empty() };
  }

  const headers = Object.keys(rows[0]);
  const columns = {
    date: findColumn(headers, DATE_HEADERS),
    on: findColumn(headers, ON_HEADERS),
    off: findColumn(headers, OFF_HEADERS),
    building: findColumn(headers, BUILDING_HEADERS),
  };

  if (!columns.on || !columns.off) {
    return {
      runs: [],
      errors: [
        {
          row: 0,
          reason:
            "Could not find the on and off columns. Name them 'On' and 'Off', with a 'Date' column beside them.",
        },
      ],
      columns,
    };
  }

  const runs: ParsedRun[] = [];
  const errors: RowError[] = [];

  rows.forEach((raw, i) => {
    // +2: one for the header row, one because spreadsheets count from 1.
    const rowNumber = i + 2;
    const onCell = raw[columns.on!];
    const offCell = raw[columns.off!];

    if (isBlank(onCell) && isBlank(offCell)) return; // a spacer row, not an error

    const day = columns.date ? toDate(raw[columns.date]) : null;
    const start = combine(day, onCell);
    let end = combine(day, offCell);

    if (!start) return void errors.push({ row: rowNumber, reason: "Could not read the on time." });
    if (!end) return void errors.push({ row: rowNumber, reason: "Could not read the off time." });

    // A set switched on at 19:00 and off at 06:00 ran through the night. This
    // is the normal case here, not an edge case, and reading it as a negative
    // duration would silently drop the busiest runs of the week.
    let crossedMidnight = false;
    if (end.getTime() <= start.getTime()) {
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
      crossedMidnight = true;
    }

    const minutes = Math.round((end.getTime() - start.getTime()) / 60000);
    if (minutes <= 0) {
      return void errors.push({ row: rowNumber, reason: "The off time is not after the on time." });
    }
    if (minutes > 24 * 60) {
      return void errors.push({
        row: rowNumber,
        reason: `That reads as ${(minutes / 60).toFixed(1)} hours in one run. Check the times.`,
      });
    }

    runs.push({
      row: rowNumber,
      startedAt: start,
      endedAt: end,
      minutes,
      buildingHint: columns.building ? asText(raw[columns.building]) : null,
      crossedMidnight,
    });
  });

  return { runs, errors, columns };
}

/**
 * Rows that overlap each other within the same upload.
 *
 * Checked before anything touches the database, because a sheet that lists the
 * same evening twice is a common copy-paste accident and would otherwise bill
 * every flat in the building twice for it.
 */
export function internalOverlaps(runs: ParsedRun[]): RowError[] {
  const sorted = [...runs].sort((a, b) => a.startedAt.getTime() - b.startedAt.getTime());
  const out: RowError[] = [];
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i].startedAt.getTime() < sorted[i - 1].endedAt.getTime()) {
      out.push({
        row: sorted[i].row,
        reason: `Overlaps row ${sorted[i - 1].row} in this same sheet.`,
      });
    }
  }
  return out;
}

function empty() {
  return { date: null, on: null, off: null, building: null };
}

function isBlank(v: unknown): boolean {
  return v === null || v === undefined || (typeof v === "string" && v.trim() === "");
}

function asText(v: unknown): string | null {
  if (isBlank(v)) return null;
  return String(v).trim();
}

function toDate(v: unknown): Date | null {
  if (v instanceof Date && !isNaN(v.getTime())) return v;
  if (typeof v === "string") {
    const parsed = new Date(v);
    if (!isNaN(parsed.getTime())) return parsed;
  }
  return null;
}

/**
 * A date column and a time column into one instant.
 *
 * Time arrives in three shapes depending on which app last touched the file: a
 * real Date, a string like "18:30" or "6:30 PM", or an Excel serial fraction
 * where 0.5 means midday. All three are common in one sheet.
 */
export function combine(day: Date | null, time: unknown): Date | null {
  if (isBlank(time)) return null;

  const base = day ? new Date(day) : null;

  if (time instanceof Date && !isNaN(time.getTime())) {
    if (!base) return time;
    const out = new Date(base);
    out.setHours(time.getHours(), time.getMinutes(), 0, 0);
    return out;
  }

  if (typeof time === "number" && time >= 0 && time < 1) {
    const minutesOfDay = Math.round(time * 24 * 60);
    const out = base ? new Date(base) : new Date();
    out.setHours(Math.floor(minutesOfDay / 60), minutesOfDay % 60, 0, 0);
    return out;
  }

  if (typeof time === "string") {
    const m = time.trim().match(/^(\d{1,2})[:.](\d{2})\s*(am|pm)?$/i);
    if (m) {
      let hour = parseInt(m[1], 10);
      const minute = parseInt(m[2], 10);
      const meridiem = m[3]?.toLowerCase();
      if (meridiem === "pm" && hour < 12) hour += 12;
      if (meridiem === "am" && hour === 12) hour = 0;
      if (hour > 23 || minute > 59) return null;
      const out = base ? new Date(base) : new Date();
      out.setHours(hour, minute, 0, 0);
      return out;
    }
    const whole = new Date(time);
    if (!isNaN(whole.getTime())) return whole;
  }

  return null;
}
