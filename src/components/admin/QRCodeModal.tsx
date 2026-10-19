"use client";

import { useState } from "react";
import { QRCodeSVG } from "qrcode.react";

interface QRCodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  eventName: string;
  eventStatus: string;
}

export function QRCodeModal({
  isOpen,
  onClose,
  eventId,
  eventName,
  eventStatus,
}: QRCodeModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  // Build the public QR code destination URL
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const showcaseUrl = `${origin}/events/${eventId}`;

  const isFinalized = eventStatus === "finalized" || eventStatus === "completed";

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(showcaseUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Fallback
      setCopied(true);
    }
  };

  const handleDownloadSVG = () => {
    const svgElement = document.getElementById("event-qr-code-svg");
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventId}-qr-code.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/60 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md bg-surface border border-border rounded-radius-lg p-6 sm:p-8 shadow-xl text-center space-y-6 animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-border pb-4">
          <div className="text-left">
            <span className="text-[10px] font-bold uppercase tracking-wider text-accent">
              Guest Event Showcase
            </span>
            <h2 id="qr-modal-title" className="text-lg font-bold text-ink font-heading mt-0.5">
              Event QR Code
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 flex items-center justify-center rounded-radius-md text-ink-muted hover:text-ink hover:bg-bg transition-colors"
            aria-label="Close QR Modal"
          >
            ✕
          </button>
        </div>

        <div>
          <p className="text-sm font-medium text-ink truncate font-heading">{eventName}</p>
          {!isFinalized ? (
            <div className="mt-3 p-3 bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300 text-xs rounded-radius-md text-left">
              ⚠️ <strong>Note:</strong> This event status is currently <em>&apos;{eventStatus}&apos;</em>.
              Guests will only be able to view the live timeline and showcase once the status is marked as <strong>Finalized</strong>.
            </div>
          ) : (
            <p className="text-xs text-ink-muted mt-1">
              Scan this QR code to view the live timeline, venue directions, and sub-events.
            </p>
          )}
        </div>

        {/* QR Code Container with high contrast border */}
        <div className="flex justify-center items-center p-6 bg-white rounded-radius-lg border border-border mx-auto w-fit shadow-sm">
          <QRCodeSVG
            id="event-qr-code-svg"
            value={showcaseUrl}
            size={200}
            level="H"
            bgColor="#ffffff"
            fgColor="#1C1A17"
            aria-label={`QR Code link to ${showcaseUrl}`}
          />
        </div>

        {/* URL Link and Copy Action */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 bg-bg border border-border rounded-radius-md px-3 py-2 text-xs text-ink">
            <span className="truncate flex-1 font-mono text-left">{showcaseUrl}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="text-xs font-semibold px-2.5 py-1 bg-accent text-accent-ink rounded-radius-sm hover:bg-accent-hover transition-colors whitespace-nowrap"
            >
              {copied ? "Copied! ✓" : "Copy"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              type="button"
              onClick={handleDownloadSVG}
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-radius-md border border-border text-xs font-semibold text-ink bg-bg hover:bg-surface transition-colors min-h-[44px]"
            >
              📥 Download SVG
            </button>
            <a
              href={showcaseUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-radius-md bg-accent text-accent-ink text-xs font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              🌐 Open Page ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
