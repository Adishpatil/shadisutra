import { describe, it, expect } from "vitest";
import {
  MAX_GUEST_IMPORT_ROWS,
  sanitizeSpreadsheetCell,
  parseGuestCSV,
  exportGuestsToExcel,
  generateGuestTemplateExcel,
  guestRowSchema,
  type GuestRow,
} from "../lib/guests/guest-engine";

describe("Guest List Engine & Security (Section 10)", () => {
  it("validates row schema according to project constraints", () => {
    // Valid row
    const valid = guestRowSchema.safeParse({
      name: "Aman Sharma",
      party_size: 4,
      rsvp: "yes",
    });
    expect(valid.success).toBe(true);

    // Invalid party size (> 50)
    const tooManyGuests = guestRowSchema.safeParse({
      name: "Big Family",
      party_size: 55,
      rsvp: "yes",
    });
    expect(tooManyGuests.success).toBe(false);

    // Missing name
    const missingName = guestRowSchema.safeParse({
      name: "",
      party_size: 2,
    });
    expect(missingName.success).toBe(false);
  });

  it("neutralises formula injection attacks by prefixing '=, +, -, @' with a single quote", () => {
    expect(sanitizeSpreadsheetCell("=SUM(A1:A10)")).toBe("'=SUM(A1:A10)");
    expect(sanitizeSpreadsheetCell("+cmd|' /C calc'!A0")).toBe("'+cmd|' /C calc'!A0");
    expect(sanitizeSpreadsheetCell("-10+5")).toBe("'-10+5");
    expect(sanitizeSpreadsheetCell("@SUM(B1:B5)")).toBe("'@SUM(B1:B5)");
    expect(sanitizeSpreadsheetCell("Normal Guest Name")).toBe("Normal Guest Name");
  });

  it("parses valid CSV data and reports errors for invalid lines", () => {
    const sampleCsv = `Name,Party Size,Phone,RSVP,Table No,Notes
Rohan Mehra,2,9876543210,yes,Table 1,Bride side
Invalid Guest,99,9999999999,pending,Table 2,Exceeds limit
Another Guest,3,,no,,`;

    const { validRows, errors } = parseGuestCSV(sampleCsv);
    expect(validRows.length).toBe(2);
    expect(validRows[0].name).toBe("Rohan Mehra");
    expect(validRows[0].party_size).toBe(2);
    expect(validRows[0].rsvp).toBe("yes");

    expect(errors.length).toBe(1);
    expect(errors[0].row).toBe(3); // Line with party size 99
  });

  it("rejects CSV imports that exceed the 2,000-row limit", () => {
    const rows = Array.from(
      { length: MAX_GUEST_IMPORT_ROWS + 1 },
      (_, index) => `Guest ${index + 1},1,,,`
    );
    const { validRows, errors } = parseGuestCSV(
      `Name,Party Size,Phone,RSVP,Table No,Notes\n${rows.join("\n")}`
    );

    expect(validRows).toHaveLength(0);
    expect(errors).toContainEqual({
      row: MAX_GUEST_IMPORT_ROWS + 2,
      message: "Import files may contain no more than 2,000 guest rows.",
    });
  });

  it("exports guests to an Excel buffer and generates a template", async () => {
    const guests: GuestRow[] = [
      {
        name: "Devendra Singhania",
        party_size: 3,
        rsvp: "yes",
        table_no: "Table 5",
      },
    ];

    const excelBuffer = await exportGuestsToExcel(guests, "Wedding");
    expect(excelBuffer.byteLength).toBeGreaterThan(100);

    const templateBuffer = await generateGuestTemplateExcel();
    expect(templateBuffer.byteLength).toBeGreaterThan(100);
  });
});
