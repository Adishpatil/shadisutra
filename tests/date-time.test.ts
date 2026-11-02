import { describe, expect, it } from "vitest";
import {
  dateTimeKolkataToIso,
  formatDate,
  formatDateTimeKolkata,
  formatTime12Hour,
  parseTime24Hour,
  toTime24Hour,
} from "../src/lib/date-time";

describe("date and time formatting", () => {
  it("formats date-only values without shifting the calendar date", () => {
    expect(formatDate("2026-11-15")).toBe("15 Nov 2026");
  });

  it("round-trips 12-hour time through a 24-hour database value", () => {
    expect(parseTime24Hour("00:05:00")).toEqual({ hour: 12, minute: 5, period: "AM" });
    expect(parseTime24Hour("12:30")).toEqual({ hour: 12, minute: 30, period: "PM" });
    expect(toTime24Hour(12, 5, "AM")).toBe("00:05");
    expect(toTime24Hour(12, 30, "PM")).toBe("12:30");
    expect(toTime24Hour(7, 45, "PM")).toBe("19:45");
    expect(formatTime12Hour("19:45:00")).toBe("7:45 PM");
  });

  it("rejects out-of-range values and interprets timeline ISO in Kolkata", () => {
    expect(toTime24Hour(13, 0, "AM")).toBeNull();
    expect(parseTime24Hour("24:00")).toBeNull();
    expect(dateTimeKolkataToIso("2026-11-15", "18:30")).toBe("2026-11-15T13:00:00.000Z");
    expect(formatDateTimeKolkata("2026-11-15T13:00:00.000Z")).toBe("15 Nov 2026, 6:30 pm");
  });
});
