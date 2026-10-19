"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  generateEventShareLink,
  revokeEventShareLink,
  type AdminEventShareLink,
} from "@/lib/events/share-actions";

interface EventShareLinkPanelProps {
  eventId: string;
  initialLink: AdminEventShareLink | null;
}

const subscribeToOrigin = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";

function defaultExpiration(): string {
  const date = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

export function EventShareLinkPanel({
  eventId,
  initialLink,
}: EventShareLinkPanelProps) {
  const [shareLink, setShareLink] = useState(initialLink);
  const [expiration, setExpiration] = useState(defaultExpiration);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin
  );
  const url = shareLink?.token && origin
    ? new URL(`/e/${shareLink.token}`, origin).toString()
    : null;

  useEffect(() => {
    if (!url) return;

    let active = true;
    QRCode.toDataURL(url, {
      errorCorrectionLevel: "H",
      width: 280,
      margin: 2,
    }).then((dataUrl) => {
      if (active) setQrCode(dataUrl);
    }).catch(() => {
      if (active) setError("The QR code could not be generated.");
    });

    return () => {
      active = false;
    };
  }, [url]);

  const handleGenerate = async () => {
    const expirationDate = new Date(expiration);
    if (!expiration || !Number.isFinite(expirationDate.getTime())) {
      setError("Choose a valid future expiration date.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await generateEventShareLink(
        eventId,
        expirationDate.toISOString()
      );
      if (!result.success) {
        setError(result.error);
        return;
      }

      setShareLink({
        token: result.token,
        expiresAt: result.expiresAt,
        revokedAt: null,
      });
      setMessage("Share link generated. Any previous link is no longer valid.");
    } catch {
      setError("Could not create the event share link.");
    } finally {
      setPending(false);
    }
  };

  const handleRevoke = async () => {
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await revokeEventShareLink(eventId);
      if (!result.success) {
        setError(result.error ?? "Could not revoke the event share link.");
        return;
      }

      setShareLink((current) =>
        current
          ? { ...current, token: null, revokedAt: new Date().toISOString() }
          : null
      );
      setMessage("Share link revoked.");
    } catch {
      setError("Could not revoke the event share link.");
    } finally {
      setPending(false);
    }
  };

  const handleCopy = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Share link copied.");
    } catch {
      setError("Could not copy the link. Select and copy it instead.");
    }
  };

  return (
    <section
      aria-labelledby="event-share-title"
      className="rounded-radius-lg border border-border bg-surface p-5 sm:p-6 space-y-4"
    >
      <div>
        <h2 id="event-share-title" className="font-heading text-xl font-bold text-ink">
          Public event link
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Share only the event details, schedule, functions, and finalized designs.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1">
          <label
            htmlFor="share-link-expiration"
            className="mb-1.5 block text-sm font-semibold text-ink"
          >
            Link expires
          </label>
          <input
            id="share-link-expiration"
            type="datetime-local"
            required
            min={defaultExpiration()}
            value={expiration}
            onChange={(event) => setExpiration(event.target.value)}
            className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-accent"
          />
        </div>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={pending || !expiration}
          className="min-h-11 rounded-radius-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-50"
        >
          {pending ? "Saving..." : shareLink ? "Regenerate link" : "Generate link"}
        </button>
      </div>

      {error && (
        <p role="alert" className="text-sm font-medium text-danger">
          {error}
        </p>
      )}
      {message && (
        <p role="status" className="text-sm font-medium text-success">
          {message}
        </p>
      )}

      {shareLink?.token && url && (
        <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0 space-y-3">
            <p className="text-sm text-ink">
              Expires{" "}
              <time dateTime={shareLink.expiresAt}>
                {new Date(shareLink.expiresAt).toLocaleString("en-GB", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "UTC",
                })}{" "}
                UTC
              </time>
            </p>
            <label htmlFor="event-share-url" className="sr-only">
              Public event link
            </label>
            <input
              id="event-share-url"
              readOnly
              value={url}
              className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-sm text-ink"
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={handleCopy}
                className="min-h-11 rounded-radius-md border border-border px-4 text-sm font-semibold text-ink hover:border-accent"
              >
                Copy link
              </button>
              {qrCode && (
                <a
                  href={qrCode}
                  download={`event-${eventId}-qr.png`}
                  className="inline-flex min-h-11 items-center rounded-radius-md border border-border px-4 text-sm font-semibold text-ink hover:border-accent"
                >
                  Download QR PNG
                </a>
              )}
              <button
                type="button"
                onClick={handleRevoke}
                disabled={pending}
                className="min-h-11 rounded-radius-md border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-light disabled:opacity-50"
              >
                Revoke link
              </button>
            </div>
          </div>
          {qrCode && (
            <div className="w-fit rounded-radius-md border border-border bg-white p-3">
              <Image
                src={qrCode}
                width={220}
                height={220}
                alt="QR code for the expiring public event link"
                unoptimized
              />
            </div>
          )}
        </div>
      )}
    </section>
  );
}
