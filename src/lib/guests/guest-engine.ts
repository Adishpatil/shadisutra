import ExcelJS from "exceljs";
import Papa from "papaparse";
import { z } from "zod";

export interface GuestRow {
  id?: string;
  name: string;
  party_size: number;
  phone?: string | null;
  rsvp: "pending" | "yes" | "no";
  table_no?: string | null;
  notes?: string | null;
}

export const MAX_GUEST_IMPORT_ROWS = 2000;

/**
 * Zod validation schema for an individual guest row per build brief:
 * - name: required, 1-100 characters
 * - party_size: integer between 1 and 50
 * - rsvp: pending | yes | no
 */
export const guestRowSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  party_size: z.coerce.number().int().min(1, "Party size must be at least 1").max(50, "Party size cannot exceed 50"),
  phone: z.string().trim().max(40).optional().nullable(),
  rsvp: z.enum(["pending", "yes", "no"]).default("pending"),
  table_no: z.string().trim().max(80).optional().nullable(),
  notes: z.string().trim().max(2000).optional().nullable(),
});

/**
 * Section 10 Formula Injection Defense:
 * Neutralise spreadsheet formula injection by prefixing any cell starting
 * with '=', '+', '-', or '@' with a single quote.
 */
export function sanitizeSpreadsheetCell(value: unknown): string {
  if (value === null || value === undefined) return "";
  const str = String(value).trim();
  if (/^[=+\-@]/.test(str)) {
    return `'${str}`;
  }
  return str;
}

/**
 * Parse and validate CSV data in the browser
 */
export function parseGuestCSV(fileContent: string): {
  validRows: GuestRow[];
  errors: { row: number; message: string }[];
} {
  const result = Papa.parse<Record<string, unknown>>(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const validRows: GuestRow[] = [];
  const errors: { row: number; message: string }[] = result.errors.map((error) => ({
    row: error.row === undefined ? 1 : error.row + 1,
    message: error.message,
  }));
  const rows = result.data;

  if (rows.length > MAX_GUEST_IMPORT_ROWS) {
    errors.push({
      row: MAX_GUEST_IMPORT_ROWS + 2,
      message: "Import files may contain no more than 2,000 guest rows.",
    });
    return { validRows, errors };
  }

  rows.slice(0, MAX_GUEST_IMPORT_ROWS).forEach((rawRow, index) => {
    const normalized = new Map(
      Object.entries(rawRow).map(([key, value]) => [key.trim().toLowerCase(), value])
    );
    const get = (...keys: string[]) => {
      for (const key of keys) {
        const value = normalized.get(key.toLowerCase());
        if (value !== undefined && value !== null && String(value).trim() !== "") {
          return String(value).trim();
        }
      }
      return null;
    };
    const rsvpValue = (get("rsvp", "rsvp status") ?? "pending").toLowerCase();
    const rsvp =
      rsvpValue === "yes" || rsvpValue === "attending"
        ? "yes"
        : rsvpValue === "no" || rsvpValue === "declined"
          ? "no"
          : rsvpValue === "pending"
            ? "pending"
            : rsvpValue;
    const parsed = guestRowSchema.safeParse({
      name: get("name", "guest name") ?? "",
      party_size: get("party size", "party_size", "guests") ?? "",
      phone: get("phone", "phone / whatsapp", "mobile"),
      rsvp,
      table_no: get("table no", "table_no", "table / seating", "table"),
      notes: get("notes", "special notes"),
    });

    if (parsed.success) {
      validRows.push(parsed.data);
    } else {
      errors.push({
        row: index + 2,
        message: parsed.error.issues.map((issue) => issue.message).join(", "),
      });
    }
  });

  return { validRows, errors };
}

/**
 * Parse and validate Excel file (.xlsx) buffer
 */
export async function parseGuestExcel(buffer: ArrayBuffer): Promise<{
  validRows: GuestRow[];
  errors: { row: number; message: string }[];
}> {
  const workbook = new ExcelJS.Workbook();
  await workbook.xlsx.load(buffer);
  const worksheet = workbook.worksheets[0];

  const validRows: GuestRow[] = [];
  const errors: { row: number; message: string }[] = [];

  if (!worksheet) {
    return { validRows: [], errors: [{ row: 1, message: "No worksheet found in file" }] };
  }

  // Row 1 is header
  let dataRowCount = 0;
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const values = [1, 2, 3, 4, 5, 6].map((column) =>
      row.getCell(column).text.trim()
    );
    if (values.every((value) => value.length === 0)) return;
    dataRowCount += 1;
    if (dataRowCount > MAX_GUEST_IMPORT_ROWS) return;

    const name = row.getCell(1).text.trim();
    const party_size = row.getCell(2).text.trim();
    const phone = row.getCell(3).text.trim() || null;
    const rsvpRaw = row.getCell(4).text.toLowerCase().trim();
    const rsvp =
      rsvpRaw === "yes" || rsvpRaw === "no" || rsvpRaw === "pending"
        ? rsvpRaw
        : rsvpRaw || "pending";
    const table_no = row.getCell(5).text.trim() || null;
    const notes = row.getCell(6).text.trim() || null;

    const parsed = guestRowSchema.safeParse({
      name,
      party_size,
      phone,
      rsvp,
      table_no,
      notes,
    });

    if (parsed.success) {
      validRows.push(parsed.data);
    } else {
      errors.push({
        row: rowNumber,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }
  });
  if (dataRowCount > MAX_GUEST_IMPORT_ROWS) {
    errors.push({
      row: MAX_GUEST_IMPORT_ROWS + 2,
      message: "Import files may contain no more than 2,000 guest rows.",
    });
    validRows.length = 0;
  }

  return { validRows, errors };
}

/**
 * Export guests list to .xlsx buffer with CSV formula injection neutralization
 */
export async function exportGuestsToExcel(guests: GuestRow[], eventName: string): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shadi Sutra Event Management";
  workbook.created = new Date();
  workbook.subject = eventName;

  const worksheet = workbook.addWorksheet("Guest List");

  worksheet.columns = [
    { header: "Guest Name", key: "name", width: 28 },
    { header: "Party Size", key: "party_size", width: 14 },
    { header: "Phone / WhatsApp", key: "phone", width: 20 },
    { header: "RSVP Status", key: "rsvp", width: 15 },
    { header: "Table / Seating", key: "table_no", width: 16 },
    { header: "Special Notes", key: "notes", width: 35 },
  ];

  // Header style
  worksheet.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FF9D7E36" }, // Accent gold
  };

  guests.forEach((g) => {
    worksheet.addRow({
      name: sanitizeSpreadsheetCell(g.name),
      party_size: Number(g.party_size) || 1,
      phone: sanitizeSpreadsheetCell(g.phone),
      rsvp: sanitizeSpreadsheetCell(g.rsvp),
      table_no: sanitizeSpreadsheetCell(g.table_no),
      notes: sanitizeSpreadsheetCell(g.notes),
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return new Uint8Array(buffer);
}

/**
 * Generate a blank downloadable Excel template for users to fill in
 */
export async function generateGuestTemplateExcel(): Promise<Uint8Array> {
  const sampleGuests: GuestRow[] = [
    {
      name: "Ramesh Verma",
      party_size: 2,
      phone: "9876543210",
      rsvp: "yes",
      table_no: "Table 4",
      notes: "Vegetarian, VIP stage seating",
    },
    {
      name: "Sunita & Rajesh Kapoor",
      party_size: 4,
      phone: "9123456789",
      rsvp: "pending",
      table_no: "Table 2",
      notes: "Arriving for Sangeet on 19th",
    },
  ];

  return exportGuestsToExcel(sampleGuests, "Shadi Sutra Guest Template");
}
