"use client";

import { useId, useState } from "react";
import { parseTime24Hour, toTime24Hour } from "@/lib/date-time";

interface TimePickerProps {
  name: string;
  label: string;
  defaultValue?: string | null;
  required?: boolean;
}

export function TimePicker({
  name,
  label,
  defaultValue,
  required = false,
}: TimePickerProps) {
  const id = useId();
  const initial = parseTime24Hour(defaultValue ?? "") ?? {
    hour: 12,
    minute: 0,
    period: "AM" as const,
  };
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);
  const value = toTime24Hour(hour, minute, period) ?? "";

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 block text-base font-semibold text-ink">
        {label}
      </legend>
      <input type="hidden" name={name} value={value} required={required} />
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
        <label className="sr-only" htmlFor={`${id}-hour`}>Hour</label>
        <select
          id={`${id}-hour`}
          value={hour}
          onChange={(event) => setHour(Number(event.target.value))}
          className="min-h-11 w-full rounded-radius-md border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
            <option key={value} value={value}>{value}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}-minute`}>Minute</label>
        <select
          id={`${id}-minute`}
          value={minute}
          onChange={(event) => setMinute(Number(event.target.value))}
          className="min-h-11 w-full rounded-radius-md border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          {Array.from({ length: 60 }, (_, value) => value).map((value) => (
            <option key={value} value={value}>{String(value).padStart(2, "0")}</option>
          ))}
        </select>
        <label className="sr-only" htmlFor={`${id}-period`}>AM or PM</label>
        <select
          id={`${id}-period`}
          value={period}
          onChange={(event) => setPeriod(event.target.value as "AM" | "PM")}
          className="min-h-11 w-full rounded-radius-md border border-border-strong bg-surface px-3 text-base text-ink focus-visible:outline-2 focus-visible:outline-accent"
        >
          <option value="AM">AM</option>
          <option value="PM">PM</option>
        </select>
      </div>
    </fieldset>
  );
}
