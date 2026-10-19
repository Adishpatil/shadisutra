/**
 * Currency and number formatting utilities.
 * Uses explicit "en-IN" locale to prevent SSR/CSR hydration mismatches
 * (the server OS locale may differ from the browser's default).
 */

const INR = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const INR_DECIMAL = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** Format a number as ₹2,15,000 (Indian grouping, no decimals) */
export function formatINR(value: number): string {
  return `₹${INR.format(value)}`;
}

/** Format a number as 2,15,000 (Indian grouping, no ₹ prefix) */
export function formatNumber(value: number): string {
  return INR.format(value);
}

/** Format a number as ₹2,15,000.00 (with paise) */
export function formatINRDecimal(value: number): string {
  return `₹${INR_DECIMAL.format(value)}`;
}

/** Format a Date as locale-safe string for display (always en-IN) */
export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
