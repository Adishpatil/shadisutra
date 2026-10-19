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

/**
 * Zod validation schema for an individual guest row per build brief:
 * - name: required, 1-100 characters
 * - party_size: integer between 1 and 50
 * - rsvp: pending | yes | no
 */
export const guestRowSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  party_size: z.coerce.number().int().min(1, "Party size must be at least 1").max(50, "Party size cannot exceed 50"),
  phone: z.string().optional().nullable(),
  rsvp: z.enum(["pending", "yes", "no"]).default("pending"),
  table_no: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
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
  const result = Papa.parse(fileContent, {
    header: true,
    skipEmptyLines: true,
  });

  const validRows: GuestRow[] = [];
  const errors: { row: number; message: string }[] = [];

  result.data.forEach((rawRow: any, index: number) => {
    // Map various possible header variations (case insensitive)
    const name = rawRow.Name || rawRow.name || rawRow["Guest Name"] || "";
    const party_size = rawRow["Party Size"] || rawRow.party_size || rawRow.Guests || rawRow.guests || 1;
    const phone = rawRow.Phone || rawRow.phone || rawRow.Mobile || null;
    const rsvpRaw = String(rawRow.RSVP || rawRow.rsvp || "pending").toLowerCase();
    const rsvp = rsvpRaw === "yes" || rsvpRaw === "attending" ? "yes" : rsvpRaw === "no" || rsvpRaw === "declined" ? "no" : "pending";
    const table_no = rawRow["Table No"] || rawRow.table_no || rawRow.Table || null;
    const notes = rawRow.Notes || rawRow.notes || null;

    const parsed = guestRowSchema.safeParse({
      name: String(name).trim(),
      party_size: Number(party_size),
      phone: phone ? String(phone).trim() : null,
      rsvp,
      table_no: table_no ? String(table_no).trim() : null,
      notes: notes ? String(notes).trim() : null,
    });

    if (parsed.success) {
      validRows.push(parsed.data as GuestRow);
    } else {
      errors.push({
        row: index + 2, // header is row 1
        message: parsed.error.issues.map((i) => i.message).join(", "),
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
  worksheet.eachRow((row, rowNumber) => {
    if (rowNumber === 1) return; // skip header

    const name = String(row.getCell(1).value || "").trim();
    const party_size = Number(row.getCell(2).value) || 1;
    const phone = row.getCell(3).value ? String(row.getCell(3).value).trim() : null;
    const rsvpRaw = String(row.getCell(4).value || "pending").toLowerCase().trim();
    const rsvp = rsvpRaw === "yes" ? "yes" : rsvpRaw === "no" ? "no" : "pending";
    const table_no = row.getCell(5).value ? String(row.getCell(5).value).trim() : null;
    const notes = row.getCell(6).value ? String(row.getCell(6).value).trim() : null;

    if (!name) return; // ignore completely empty lines

    const parsed = guestRowSchema.safeParse({
      name,
      party_size,
      phone,
      rsvp,
      table_no,
      notes,
    });

    if (parsed.success) {
      validRows.push(parsed.data as GuestRow);
    } else {
      errors.push({
        row: rowNumber,
        message: parsed.error.issues.map((i) => i.message).join(", "),
      });
    }
  });

  return { validRows, errors };
}

/**
 * Export guests list to .xlsx buffer with CSV formula injection neutralization
 */
export async function exportGuestsToExcel(guests: GuestRow[], eventName: string): Promise<Uint8Array> {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = "Shadi Sutra Event Management";
  workbook.created = new Date();

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
