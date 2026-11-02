const KOLKATA_TIME_ZONE = "Asia/Kolkata";

export function formatDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(value.getTime()) || value.toISOString().slice(0, 10) !== date) return date;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function parseTime24Hour(value: string): {
  hour: number;
  minute: number;
  period: "AM" | "PM";
} | null {
  const match = /^([01]\d|2[0-3]):([0-5]\d)(?::[0-5]\d(?:\.\d+)?)?$/.exec(value);
  if (!match) return null;
  const hour24 = Number(match[1]);
  return {
    hour: hour24 % 12 || 12,
    minute: Number(match[2]),
    period: hour24 < 12 ? "AM" : "PM",
  };
}

export function toTime24Hour(
  hour: number,
  minute: number,
  period: "AM" | "PM"
): string | null {
  if (!Number.isInteger(hour) || hour < 1 || hour > 12) return null;
  if (!Number.isInteger(minute) || minute < 0 || minute > 59) return null;
  const hour24 = (hour % 12) + (period === "PM" ? 12 : 0);
  return `${String(hour24).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

export function formatTime12Hour(value: string): string {
  const parts = parseTime24Hour(value);
  if (!parts) return value;
  return `${parts.hour}:${String(parts.minute).padStart(2, "0")} ${parts.period}`;
}

export function formatDateTimeKolkata(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: KOLKATA_TIME_ZONE,
  }).format(date);
}

export function timeInKolkata(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: KOLKATA_TIME_ZONE,
  }).formatToParts(date);
  const hour = parts.find((part) => part.type === "hour")?.value;
  const minute = parts.find((part) => part.type === "minute")?.value;
  return hour && minute ? `${hour}:${minute}` : null;
}

export function dateTimeKolkataToIso(date: string, time: string): string | null {
  const dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!dateMatch || !parseTime24Hour(time)) return null;
  const dateValue = new Date(Date.UTC(Number(dateMatch[1]), Number(dateMatch[2]) - 1, Number(dateMatch[3])));
  if (Number.isNaN(dateValue.getTime()) || dateValue.toISOString().slice(0, 10) !== date) return null;
  const parsed = new Date(`${date}T${time.slice(0, 5)}:00+05:30`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}
