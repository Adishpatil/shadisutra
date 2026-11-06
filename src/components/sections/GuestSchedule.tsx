"use client";

import { useId, useState } from "react";
import { useReveal } from "@/components/ui/useReveal";

interface ScheduleEntry {
  startsAt: string;
  time: string;
  title: string;
}

export function GuestSchedule({ entries }: { entries: ScheduleEntry[] }) {
  useReveal();
  const [open, setOpen] = useState(false);
  const scheduleId = useId();

  return (
    <section aria-labelledby="timeline-title" className="mt-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h2 id="timeline-title" className="font-heading text-2xl font-bold text-ink">
          The schedule
        </h2>
        <button
          type="button"
          aria-expanded={open}
          aria-controls={scheduleId}
          onClick={() => setOpen((current) => !current)}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-5 text-base font-semibold text-bg transition-colors hover:bg-brand hover:text-ink focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {open ? "Close the schedule" : "Open the schedule"}
        </button>
      </div>
      <ol
        id={scheduleId}
        hidden={!open}
        aria-hidden={!open}
        className="mt-4 space-y-3"
      >
        {entries.length ? (
          entries.map((entry, index) => (
            <li
              key={`${entry.startsAt}-${entry.title}-${index}`}
              data-reveal="up"
              className="guest-timeline-entry rounded-2xl border border-border bg-surface p-4"
            >
              <time dateTime={entry.startsAt} className="text-base font-semibold text-ink">
                {entry.time}
              </time>
              <p className="mt-1 break-words text-base text-ink">{entry.title}</p>
            </li>
          ))
        ) : (
          <li className="rounded-2xl border border-border bg-surface p-4 text-base text-ink-muted">
            The schedule will be shared here when available.
          </li>
        )}
      </ol>
    </section>
  );
}
