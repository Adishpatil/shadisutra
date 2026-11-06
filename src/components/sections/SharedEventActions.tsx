"use client";

import { siteLinks, hasSiteValue, site } from "@/config/site";

interface SharedEventActionsProps {
  name: string;
  date: string;
  venue: string;
  functions: Array<{ name: string; date: string; start_time: string | null }>;
}

function escapeCalendarText(value: string) {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

function toCalendarDate(value: string) {
  return value.replaceAll("-", "");
}

function nextCalendarDate(value: string) {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + 1);
  return toCalendarDate(date.toISOString().slice(0, 10));
}

function toCalendarUtc(value: string) {
  return new Date(value).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
}

export function SharedEventActions({
  name,
  date,
  venue,
  functions,
}: SharedEventActionsProps) {
  const mapUrl = venue
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(venue)}`
    : null;

  const downloadCalendar = () => {
    const datedFunctions = functions.filter(
      (eventFunction) => eventFunction.start_time
    );
    const events = datedFunctions.length
      ? datedFunctions.map((eventFunction) => {
          const startDate = new Date(
            `${eventFunction.date}T${eventFunction.start_time}+05:30`
          );
          const start = toCalendarUtc(startDate.toISOString());
          const end = toCalendarUtc(
            new Date(startDate.getTime() + 3 * 60 * 60 * 1000).toISOString()
          );
          return [
            "BEGIN:VEVENT",
            `UID:${crypto.randomUUID()}@shadisutra`,
            `DTSTAMP:${toCalendarUtc(new Date().toISOString())}`,
            `DTSTART:${start}`,
            `DTEND:${end}`,
            `SUMMARY:${escapeCalendarText(`${name} - ${eventFunction.name}`)}`,
            `LOCATION:${escapeCalendarText(venue)}`,
            "END:VEVENT",
          ];
        })
      : [[
          "BEGIN:VEVENT",
          `UID:${crypto.randomUUID()}@shadisutra`,
          `DTSTAMP:${toCalendarUtc(new Date().toISOString())}`,
          `DTSTART;VALUE=DATE:${toCalendarDate(date)}`,
          `DTEND;VALUE=DATE:${nextCalendarDate(date)}`,
          `SUMMARY:${escapeCalendarText(name)}`,
          `LOCATION:${escapeCalendarText(venue)}`,
          "END:VEVENT",
        ]];
    const calendar = [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Shadi Sutra//Event Invitation//EN",
      "CALSCALE:GREGORIAN",
      "METHOD:PUBLISH",
      ...events.flat(),
      "END:VCALENDAR",
    ].join("\r\n");
    const url = URL.createObjectURL(
      new Blob([calendar], { type: "text/calendar;charset=utf-8" })
    );
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `${name.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-|-$/g, "") || "event"}.ics`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  };

  return (
    <div className="flex flex-wrap gap-3">
      <button
        type="button"
        onClick={downloadCalendar}
        className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg transition-colors hover:bg-brand hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Add to calendar
      </button>
      {mapUrl && (
        <a
          href={mapUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink transition-colors hover:bg-brand-soft focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Open in Maps
        </a>
      )}
      {hasSiteValue(site.phone) && (
        <a
          href={siteLinks.phoneUrl}
          className="inline-flex min-h-11 items-center justify-center rounded-full border border-border-strong px-5 text-base font-semibold text-ink transition-colors hover:bg-brand-soft focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Call host or planner
        </a>
      )}
    </div>
  );
}
