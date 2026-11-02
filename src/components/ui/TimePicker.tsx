"use client";

import { useState } from "react";
import { parseTime24Hour, toTime24Hour } from "@/lib/date-time";
import { Select, type SelectOption } from "@/components/ui/Select";

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
  const initial = parseTime24Hour(defaultValue ?? "") ?? {
    hour: 12,
    minute: 0,
    period: "AM" as const,
  };
  const [hour, setHour] = useState(initial.hour);
  const [minute, setMinute] = useState(initial.minute);
  const [period, setPeriod] = useState<"AM" | "PM">(initial.period);
  const value = toTime24Hour(hour, minute, period) ?? "";
  const hourOptions: readonly SelectOption[] = Array.from(
    { length: 12 },
    (_, index) => ({ value: String(index + 1), label: String(index + 1) })
  );
  const minuteOptions: readonly SelectOption[] = Array.from(
    { length: 60 },
    (_, minuteValue) => ({
      value: String(minuteValue),
      label: String(minuteValue).padStart(2, "0"),
    })
  );
  const periodOptions: readonly SelectOption[] = [
    { value: "AM", label: "AM" },
    { value: "PM", label: "PM" },
  ];

  return (
    <fieldset className="min-w-0">
      <legend className="mb-1 block text-base font-semibold text-ink">
        {label}
      </legend>
      <input type="hidden" name={name} value={value} required={required} />
      <div className="grid grid-cols-[1fr_1fr_1fr] gap-2">
        <Select
          ariaLabel="Hour"
          value={String(hour)}
          options={hourOptions}
          onChange={(nextHour) => setHour(Number(nextHour))}
        />
        <Select
          ariaLabel="Minute"
          value={String(minute)}
          options={minuteOptions}
          onChange={(nextMinute) => setMinute(Number(nextMinute))}
        />
        <Select
          ariaLabel="AM or PM"
          value={period}
          options={periodOptions}
          onChange={(nextPeriod) =>
            setPeriod(nextPeriod === "PM" ? "PM" : "AM")
          }
        />
      </div>
    </fieldset>
  );
}
