"use client";

import Image from "next/image";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  generateEventShareLink,
  revokeEventShareLink,
  type AdminEventShareLink,
} from "@/lib/events/share-actions";
import { dateTimeKolkataToIso, formatDateTimeKolkata } from "@/lib/date-time";
import { TimePicker } from "@/components/ui/TimePicker";

interface EventShareLinkPanelProps {
  eventId: string;
  initialLink: AdminEventShareLink | null;
  publicOrigin: string | null;
}

const subscribeToOrigin = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function EventShareLinkPanel({
  eventId,
  initialLink,
  publicOrigin,
}: EventShareLinkPanelProps) {
  const [shareLink, setShareLink] = useState(initialLink);
  const [expirationDate, setExpirationDate] = useState("");
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [expired, setExpired] = useState(false);
  const origin = useSyncExternalStore(
    subscribeToOrigin,
    getBrowserOrigin,
    getServerOrigin
  );
  const linkOrigin = publicOrigin || origin;
  const url = shareLink?.token && linkOrigin
    ? new URL(`/e/${shareLink.token}`, `${linkOrigin}/`).toString()
    : null;
  const qrTarget = shareLink?.token && linkOrigin
    ? new URL(`/scan/guest/${shareLink.token}`, `${linkOrigin}/`).toString()
    : null;
  const qrUsesLocalOrigin = (() => {
    if (!qrTarget) return false;
    const hostname = new URL(qrTarget).hostname;
    return hostname === "localhost" || hostname === "127.0.0.1" ||
      hostname === "[::1]" || hostname.endsWith(".local");
  })();

  useEffect(() => {
    if (!qrTarget) return;

    let active = true;
    import("qrcode").then(({ default: QRCode }) => QRCode.toDataURL(qrTarget, {
      errorCorrectionLevel: "H",
      width: 420,
      margin: 4,
    })).then((dataUrl) => {
      if (active) setQr({ url: qrTarget, dataUrl });
    }).catch(() => {
      if (active) setError("The QR code could not be generated.");
    });

    return () => {
      active = false;
    };
  }, [qrTarget]);
  const qrCode = qr?.url === qrTarget ? qr.dataUrl : null;

  useEffect(() => {
    if (!shareLink?.token) return;

    let timeout: number;
    const checkExpiry = () => {
      const remaining = new Date(shareLink.expiresAt).getTime() - Date.now();
      if (remaining <= 0) {
        setExpired(true);
        return;
      }
      timeout = window.setTimeout(checkExpiry, Math.min(remaining, 2_147_483_647));
    };
    timeout = window.setTimeout(
      checkExpiry,
      Math.min(
        Math.max(0, new Date(shareLink.expiresAt).getTime() - Date.now()),
        2_147_483_647
      )
    );

    return () => window.clearTimeout(timeout);
  }, [shareLink?.expiresAt, shareLink?.token]);

  const handleGenerate = async (formData: FormData) => {
    const date = String(formData.get("expiryDate") ?? "");
    const time = String(formData.get("expiryTime") ?? "");
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    const expiration = parsedDate?.toISOString().slice(0, 10) === date
      ? dateTimeKolkataToIso(date, time)
      : null;
    if (!expiration || new Date(expiration).getTime() <= Date.now()) {
      setError("Choose a valid future expiration date.");
      return;
    }

    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await generateEventShareLink(
        eventId,
        expiration
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
      setExpired(false);
      setMessage("Share link generated. Any previous link is no longer valid.");
    } catch {
      setError("Could not create the event share link.");
    } finally {
      setPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Revoke the Guest link? The Client link will remain active.")) return;
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
          Guest link
        </h2>
        <p className="mt-1 text-sm text-ink-muted">
          Share the public event details, schedule, and functions with guests.
        </p>
      </div>

      <form action={handleGenerate} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div className="flex-1">
          <label
            htmlFor="share-link-expiration"
            className="mb-1.5 block text-base font-semibold text-ink"
          >
            Link expires
          </label>
          <input
            id="share-link-expiration"
            name="expiryDate"
            type="date"
            required
            value={expirationDate}
            onChange={(event) => setExpirationDate(event.target.value)}
            className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-base text-ink focus:outline-none focus:ring-2 focus:ring-ink"
          />
        </div>
        <TimePicker name="expiryTime" label="Expiry time (IST)" defaultValue="23:59" />
        <button type="submit" disabled={pending || !expirationDate} className="min-h-11 rounded-radius-md bg-brand-strong px-5 py-2.5 text-base font-semibold text-bg hover:bg-brand disabled:opacity-50">
          {pending ? "Saving..." : shareLink?.token ? "Regenerate Guest link" : "Generate Guest link"}
        </button>
      </form>

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

      {shareLink && (
        <p
          role="status"
          className={`w-fit rounded-full px-3 py-1 text-sm font-semibold ${
            shareLink.revokedAt
              ? "bg-danger-light text-danger"
              : expired
                ? "bg-warning-light text-warning"
                : shareLink.token
                  ? "bg-success-light text-success"
                  : "bg-bg text-ink-muted"
          }`}
        >
          {shareLink.revokedAt
            ? "Revoked"
            : expired
              ? "Expired"
              : shareLink.token
                ? "Active"
                : "Not generated"}
        </p>
      )}

      {shareLink?.token && url && (
        <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0 space-y-3">
            <p className="text-sm text-ink">
              Expires{" "}
              <time dateTime={shareLink.expiresAt}>
                {formatDateTimeKolkata(shareLink.expiresAt)} IST
              </time>
            </p>
            <label htmlFor="event-share-url" className="sr-only">
              Guest link
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
                className="min-h-11 rounded-full border border-border px-4 text-sm font-semibold text-ink hover:border-brand-strong"
              >
                Copy Guest link
              </button>
              <a
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-ink hover:border-brand-strong"
              >
                Open link
              </a>
              {qrCode && (
                <a
                  href={qrCode}
                  download={`event-${eventId}-guest-qr.png`}
                  className="inline-flex min-h-11 items-center rounded-full border border-border px-4 text-sm font-semibold text-ink hover:border-brand-strong"
                >
                  Download Guest QR PNG
                </a>
              )}
              <button
                type="button"
                onClick={handleRevoke}
                disabled={pending}
                className="min-h-11 rounded-full border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-light disabled:opacity-50"
              >
                Revoke Guest link
              </button>
            </div>
          </div>
          {qrCode && (
            <div className="space-y-2">
              <div className="w-fit rounded-2xl border border-border bg-white p-4 shadow-[var(--shadow-sm)]">
                <Image
                  src={qrCode}
                  width={320}
                  height={320}
                  alt="QR code for the guest event link"
                  unoptimized
                />
              </div>
              <p className="max-w-80 text-center text-sm text-ink-muted">Scan to open the event link</p>
            </div>
          )}
        </div>
      )}
      {qrUsesLocalOrigin && (
        <p role="alert" className="rounded-xl border border-warning/30 bg-warning-light p-3 text-sm text-warning">
          This QR uses a local address and won&apos;t open on another device. Set the public site URL in deployment settings, then reload this page.
        </p>
      )}
    </section>
  );
}
