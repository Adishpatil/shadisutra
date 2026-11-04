"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { KeyboardEvent } from "react";
import { createPortal } from "react-dom";

export interface SelectOption {
  label: string;
  value: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  label?: string;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  invalid?: boolean;
  value: string;
  options: readonly SelectOption[];
  onChange: (value: string) => void;
  className?: string;
}

export function Select({
  id,
  name,
  label,
  ariaLabel,
  ariaDescribedBy,
  invalid = false,
  value,
  options,
  onChange,
  className = "",
}: SelectProps) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const listId = `${controlId}-options`;
  const rootRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [open, setOpen] = useState(false);
  const [popupStyle, setPopupStyle] = useState<React.CSSProperties | null>(null);
  const [activeIndex, setActiveIndex] = useState(() =>
    Math.max(0, options.findIndex((option) => option.value === value))
  );
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      if (
        event.target instanceof Node &&
        !rootRef.current?.contains(event.target) &&
        !popupRef.current?.contains(event.target)
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  useEffect(() => {
    if (!open) {
      setPopupStyle(null);
      return;
    }

    const positionPopup = () => {
      const control = controlRef.current;
      if (!control) return;
      const rect = control.getBoundingClientRect();
      const gap = 8;
      const maxHeight = 288;
      const spaceBelow = Math.max(0, window.innerHeight - rect.bottom - gap);
      const spaceAbove = Math.max(0, rect.top - gap);
      const openAbove = spaceBelow < Math.min(maxHeight, options.length * 44 + 12) &&
        spaceAbove > spaceBelow;
      const availableHeight = Math.min(maxHeight, openAbove ? spaceAbove : spaceBelow);
      const width = Math.min(rect.width, window.innerWidth - 16);
      const left = Math.max(8, Math.min(rect.left, window.innerWidth - width - 8));

      setPopupStyle({
        position: "fixed",
        left,
        top: openAbove
          ? Math.max(8, rect.top - gap - availableHeight)
          : rect.bottom + gap,
        width,
        maxHeight: availableHeight,
        zIndex: 110,
      });
    };

    positionPopup();
    window.addEventListener("resize", positionPopup);
    window.addEventListener("scroll", positionPopup, true);
    return () => {
      window.removeEventListener("resize", positionPopup);
      window.removeEventListener("scroll", positionPopup, true);
    };
  }, [open, options.length]);

  useEffect(() => {
    if (open) optionRefs.current[activeIndex]?.focus();
  }, [activeIndex, open]);

  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    setActiveIndex(index);
    setOpen(false);
    rootRef.current?.querySelector("button")?.focus();
  };

  const onControlKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex(Math.max(0, options.findIndex((item) => item.value === value)));
      setOpen(true);
    } else if (event.key === "Escape" && open) {
      event.preventDefault();
      setOpen(false);
    }
  };

  const onOptionKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      event.preventDefault();
      setOpen(false);
      rootRef.current?.querySelector("button")?.focus();
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      event.preventDefault();
      const delta = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex((index) => (index + delta + options.length) % options.length);
    } else if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      setActiveIndex(event.key === "Home" ? 0 : options.length - 1);
    } else if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      choose(activeIndex);
    } else if (event.key === "Tab") {
      setOpen(false);
    }
  };

  return (
    <div ref={rootRef} className={`relative min-w-0 ${className}`}>
      {label && (
        <label
          htmlFor={controlId}
          className="mb-1.5 block text-base font-medium text-ink"
        >
          {label}
        </label>
      )}
      {name && <input type="hidden" name={name} value={value} />}
      <button
        ref={controlRef}
        id={controlId}
        type="button"
        role="combobox"
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedBy}
        aria-invalid={invalid || undefined}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? listId : undefined}
        onClick={() => {
          setActiveIndex(Math.max(0, options.findIndex((item) => item.value === value)));
          setOpen((state) => !state);
        }}
        onKeyDown={onControlKeyDown}
        className={`flex min-h-11 w-full items-center justify-between gap-3 rounded-xl border bg-surface px-4 py-2.5 text-left text-base text-ink shadow-[var(--shadow-sm)] transition-colors hover:border-ink/40 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          invalid ? "border-danger" : "border-border-strong"
        }`}
      >
        <span>{selected?.label ?? "Select an option"}</span>
        <svg
          aria-hidden="true"
          className={`h-4 w-4 shrink-0 transition-transform ${open ? "rotate-180" : ""}`}
          viewBox="0 0 20 20"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m4 7 6 6 6-6" />
        </svg>
      </button>
      {open && popupStyle && typeof document !== "undefined" &&
        createPortal(
          <div
            ref={popupRef}
            id={listId}
            role="listbox"
            aria-label={label ?? ariaLabel}
            onKeyDown={onOptionKeyDown}
            style={popupStyle}
            className="select-popup overflow-y-auto rounded-xl border border-border-strong bg-surface p-1.5 text-ink shadow-[var(--shadow-lg)]"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                ref={(element) => {
                  optionRefs.current[index] = element;
                }}
                role="option"
                aria-selected={value === option.value}
                tabIndex={-1}
                onClick={() => choose(index)}
                className="flex min-h-11 cursor-pointer items-center justify-between rounded-lg px-3 py-2 text-base text-ink outline-none hover:bg-brand-soft focus-visible:bg-brand-soft"
              >
                {option.label}
                {value === option.value && (
                  <span aria-hidden="true" className="text-sm text-ink-muted">
                    Selected
                  </span>
                )}
              </div>
            ))}
          </div>,
          document.body
        )}
    </div>
  );
}
