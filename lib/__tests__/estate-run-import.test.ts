import { describe, it, expect } from "vitest";
import * as XLSX from "xlsx";
import { parseRunSheet, internalOverlaps, combine } from "../estate/runImport";
import { statusFor, noticeDue } from "../estate/service";

function sheet(rows: Array<Record<string, unknown>>): Buffer {
  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Log");
  return XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
}

describe("combine", () => {
  const day = new Date(2026, 8, 20);

  it("reads a 24-hour string", () => {
    expect(combine(day, "18:30")?.getHours()).toBe(18);
    expect(combine(day, "18:30")?.getMinutes()).toBe(30);
  });

  it("reads am and pm", () => {
    expect(combine(day, "6:30 PM")?.getHours()).toBe(18);
    expect(combine(day, "6:30 am")?.getHours()).toBe(6);
    expect(combine(day, "12:15 AM")?.getHours()).toBe(0);
    expect(combine(day, "12:15 PM")?.getHours()).toBe(12);
  });

  it("reads an Excel time fraction", () => {
    expect(combine(day, 0.5)?.getHours()).toBe(12);
    expect(combine(day, 0.75)?.getHours()).toBe(18);
  });

  it("puts the time on the given day, not today", () => {
    expect(combine(day, "18:30")?.getDate()).toBe(20);
  });

  it("refuses nonsense rather than guessing", () => {
    expect(combine(day, "")).toBeNull();
    expect(combine(day, "sometime in the evening")).toBeNull();
    expect(combine(day, "25:99")).toBeNull();
    expect(combine(day, null)).toBeNull();
  });
});

describe("parseRunSheet", () => {
  it("reads a plain log", () => {
    const r = parseRunSheet(
      sheet([
        { Date: "2026-09-20", On: "18:00", Off: "22:00" },
        { Date: "2026-09-21", On: "19:00", Off: "23:30" },
      ]),
    );
    expect(r.errors).toHaveLength(0);
    expect(r.runs).toHaveLength(2);
    expect(r.runs[0].minutes).toBe(240);
    expect(r.runs[1].minutes).toBe(270);
  });

  it("carries an overnight run into the next day instead of dropping it", () => {
    const r = parseRunSheet(sheet([{ Date: "2026-09-20", On: "19:00", Off: "06:00" }]));
    expect(r.errors).toHaveLength(0);
    expect(r.runs[0].minutes).toBe(11 * 60);
    expect(r.runs[0].crossedMidnight).toBe(true);
  });

  it("finds the columns whatever the supervisor called them", () => {
    const r = parseRunSheet(
      sheet([{ Day: "2026-09-20", "Time On": "18:00", "Time Off": "22:00", House: "H18" }]),
    );
    expect(r.columns.date).toBe("Day");
    expect(r.columns.on).toBe("Time On");
    expect(r.columns.off).toBe("Time Off");
    expect(r.runs[0].buildingHint).toBe("H18");
  });

  it("does not mistake a Location column for the On column", () => {
    const r = parseRunSheet(
      sheet([{ Date: "2026-09-20", Location: "H18", On: "18:00", Off: "22:00" }]),
    );
    expect(r.columns.on).toBe("On");
    expect(r.columns.building).toBe("Location");
  });

  it("skips spacer rows without calling them errors", () => {
    const r = parseRunSheet(
      sheet([
        { Date: "2026-09-20", On: "18:00", Off: "22:00" },
        { Date: null, On: null, Off: null },
        { Date: "2026-09-21", On: "18:00", Off: "20:00" },
      ]),
    );
    expect(r.errors).toHaveLength(0);
    expect(r.runs).toHaveLength(2);
  });

  it("reports the row number a bad time sits on", () => {
    const r = parseRunSheet(
      sheet([
        { Date: "2026-09-20", On: "18:00", Off: "22:00" },
        { Date: "2026-09-21", On: "whenever", Off: "22:00" },
      ]),
    );
    expect(r.runs).toHaveLength(1);
    expect(r.errors[0].row).toBe(3);
    expect(r.errors[0].reason).toMatch(/on time/);
  });

  it("refuses a run longer than a day rather than billing it", () => {
    const r = parseRunSheet(sheet([{ Date: "2026-09-20", On: "2026-09-20 06:00", Off: "2026-09-23 06:00" }]));
    expect(r.runs).toHaveLength(0);
    expect(r.errors[0].reason).toMatch(/hours in one run/);
  });

  it("says so plainly when the columns are not there", () => {
    const r = parseRunSheet(sheet([{ Something: 1, Else: 2 }]));
    expect(r.runs).toHaveLength(0);
    expect(r.errors[0].reason).toMatch(/on and off columns/);
  });
});

describe("internalOverlaps", () => {
  const run = (row: number, from: string, to: string) => ({
    row,
    startedAt: new Date(from),
    endedAt: new Date(to),
    minutes: 60,
    buildingHint: null,
    crossedMidnight: false,
  });

  it("catches the same evening pasted in twice", () => {
    const out = internalOverlaps([
      run(2, "2026-09-20T18:00:00", "2026-09-20T22:00:00"),
      run(3, "2026-09-20T19:00:00", "2026-09-20T23:00:00"),
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].row).toBe(3);
  });

  it("leaves back-to-back runs alone", () => {
    expect(
      internalOverlaps([
        run(2, "2026-09-20T18:00:00", "2026-09-20T22:00:00"),
        run(3, "2026-09-20T22:00:00", "2026-09-21T02:00:00"),
      ]),
    ).toHaveLength(0);
  });
});

describe("service clock", () => {
  it("counts down to the interval", () => {
    expect(statusFor(0, 200)).toBe("OK");
    expect(statusFor(179, 200)).toBe("OK");
    expect(statusFor(185, 200)).toBe("DUE_SOON");
    expect(statusFor(200, 200)).toBe("DUE");
    expect(statusFor(230, 200)).toBe("DUE");
    expect(statusFor(260, 200)).toBe("OVERDUE");
  });

  it("sends each notice once and not again", () => {
    expect(noticeDue("DUE_SOON", null, null)).toBe("WARN");
    expect(noticeDue("DUE_SOON", new Date(), null)).toBeNull();
    expect(noticeDue("DUE", new Date(), null)).toBe("DUE");
    expect(noticeDue("DUE", new Date(), new Date())).toBeNull();
    expect(noticeDue("OVERDUE", new Date(), new Date())).toBeNull();
  });

  it("escalates straight to the due notice if the warning was never sent", () => {
    expect(noticeDue("OVERDUE", null, null)).toBe("DUE");
  });

  it("says nothing while there is plenty of time", () => {
    expect(noticeDue("OK", null, null)).toBeNull();
  });
});
