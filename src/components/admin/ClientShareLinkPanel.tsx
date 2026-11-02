"use client";

import Image from "next/image";
import QRCode from "qrcode";
import { useEffect, useState, useSyncExternalStore } from "react";
import {
  generateEventClientLink,
  revokeEventClientLink,
  setEventClientPin,
  setEventPaymentsVisibility,
  type AdminEventClientShareLink,
} from "@/lib/events/client-share-actions";
import { dateTimeKolkataToIso, formatDateTimeKolkata } from "@/lib/date-time";
import { TimePicker } from "@/components/ui/TimePicker";

interface ClientShareLinkPanelProps {
  eventId: string;
  initialLink: AdminEventClientShareLink | null;
  initialPaymentsVisible: boolean;
}

const subscribeToOrigin = () => () => {};
const getBrowserOrigin = () => window.location.origin;
const getServerOrigin = () => "";

export function ClientShareLinkPanel({
  eventId,
  initialLink,
  initialPaymentsVisible,
}: ClientShareLinkPanelProps) {
  const [link, setLink] = useState(initialLink);
  const [expiryDate, setExpiryDate] = useState("");
  const [qr, setQr] = useState<{ url: string; dataUrl: string } | null>(null);
  const [pin, setPin] = useState("");
  const [paymentsVisible, setPaymentsVisible] = useState(initialPaymentsVisible);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const origin = useSyncExternalStore(subscribeToOrigin, getBrowserOrigin, getServerOrigin);
  const url = link?.token && origin ? new URL(`/c/${link.token}`, origin).toString() : null;

  useEffect(() => {
    if (!url) return;
    let active = true;
    QRCode.toDataURL(url, { errorCorrectionLevel: "H", width: 280, margin: 2 })
      .then((value) => { if (active) setQr({ url, dataUrl: value }); })
      .catch(() => { if (active) setError("The client QR code could not be generated."); });
    return () => { active = false; };
  }, [url]);
  const qrCode = qr?.url === url ? qr.dataUrl : null;

  const handleGenerate = async (formData: FormData) => {
    const date = String(formData.get("expiryDate") ?? "");
    const parsedDate = /^\d{4}-\d{2}-\d{2}$/.test(date) ? new Date(`${date}T00:00:00Z`) : null;
    const time = String(formData.get("expiryTime") ?? "");
    if (!parsedDate || parsedDate.toISOString().slice(0, 10) !== date) {
      setError("Choose a valid expiry date.");
      return;
    }
    const expiresAt = dateTimeKolkataToIso(date, time);
    if (!expiresAt || new Date(expiresAt).getTime() <= Date.now()) {
      setError("Choose a future expiry date and time.");
      return;
    }
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await generateEventClientLink(eventId, expiresAt, pin);
      if (!result.success) {
        setError(result.error);
        return;
      }
      setLink({ token: result.token, expiresAt: result.expiresAt, revokedAt: null, hasPin: result.hasPin });
      setMessage("Client link generated. Any previous client link is revoked.");
    } catch {
      setError("Could not create the client link.");
    } finally {
      setPending(false);
    }
  };

  const handleRevoke = async () => {
    if (!confirm("Revoke this client link? The guest link will remain active.")) return;
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await revokeEventClientLink(eventId);
      if (!result.success) {
        setError(result.error ?? "Could not revoke the client link.");
        return;
      }
      setLink((current) => current ? { ...current, token: null, revokedAt: new Date().toISOString() } : current);
      setMessage("Client link revoked. The guest link was not changed.");
    } catch {
      setError("Could not revoke the client link.");
    } finally {
      setPending(false);
    }
  };

  const handleSetPin = async (formData: FormData) => {
    const value = String(formData.get("newPin") ?? "");
    setPending(true);
    setError(null);
    setMessage(null);
    try {
      const result = await setEventClientPin(eventId, value);
      if (!result.success) {
        setError(result.error ?? "Could not update the client PIN.");
        return;
      }
      setPin("");
      setLink((current) => current ? { ...current, hasPin: Boolean(result.hasPin) } : current);
      setMessage(result.hasPin ? "Client PIN updated." : "Client PIN removed.");
    } catch {
      setError("Could not update the client PIN.");
    } finally {
      setPending(false);
    }
  };

  const handleVisibilityChange = async (checked: boolean) => {
    setPending(true);
    setError(null);
    try {
      const result = await setEventPaymentsVisibility(eventId, checked);
      if (!result.success) {
        setError(result.error ?? "Could not update payment visibility.");
        return;
      }
      setPaymentsVisible(checked);
      setMessage(checked ? "Client payment summary is visible." : "Client payment summary is hidden.");
    } catch {
      setError("Could not update payment visibility.");
    } finally {
      setPending(false);
    }
  };

  const copyLink = async () => {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Client link copied.");
    } catch {
      setError("Could not copy the client link.");
    }
  };

  return (
    <section aria-labelledby="client-share-title" className="space-y-5 rounded-radius-lg border border-border bg-surface p-5 sm:p-6">
      <div>
        <h2 id="client-share-title" className="font-heading text-xl font-bold text-ink">Client link</h2>
        <p className="mt-1 text-sm text-ink-muted">Private read-only event details for the paying client. This link is separate from the guest link. Regenerating retains the current PIN unless you change it below.</p>
      </div>

      <form action={handleGenerate} className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <div>
          <label htmlFor="client-expiry-date" className="mb-1 block text-base font-semibold">Link expires</label>
          <input id="client-expiry-date" name="expiryDate" type="date" required value={expiryDate} onChange={(event) => setExpiryDate(event.target.value)} className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-base" />
        </div>
        <div>
        <TimePicker name="expiryTime" label="Expiry time (IST)" defaultValue="23:59" />
        </div>
        <button type="submit" disabled={pending} className="min-h-11 rounded-radius-md bg-accent px-5 text-base font-semibold text-accent-ink hover:bg-accent-hover disabled:opacity-50">
          {pending ? "Saving..." : link?.token ? "Regenerate client link" : "Generate client link"}
        </button>
      </form>

      {link?.token && (
        <form action={handleSetPin} className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
          <div>
            <label htmlFor="client-link-pin" className="mb-1 block text-base font-semibold">Set or change PIN</label>
            <input id="client-link-pin" name="newPin" type="password" inputMode="numeric" pattern="[0-9]{4,6}" minLength={4} maxLength={6} autoComplete="new-password" value={pin} onChange={(event) => setPin(event.target.value)} placeholder={link.hasPin ? "Enter new 4-6 digit PIN" : "Optional 4-6 digit PIN"} className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-base" />
            <p className="mt-1 text-sm text-ink-muted">{link.hasPin ? "A PIN is currently set. Leave blank to remove it." : "PINs are stored as scrypt hashes only."}</p>
          </div>
          <button type="submit" disabled={pending} className="min-h-11 rounded-radius-md border border-border px-5 text-base font-semibold text-ink hover:border-accent disabled:opacity-50">Save PIN</button>
        </form>
      )}

      <label className="flex min-h-11 items-center gap-3 text-base font-medium text-ink">
        <input type="checkbox" checked={paymentsVisible} disabled={pending} onChange={(event) => void handleVisibilityChange(event.target.checked)} className="h-5 w-5 accent-accent" />
        Show payment summary and history on client link
      </label>

      {error && <p role="alert" className="text-sm font-medium text-danger">{error}</p>}
      {message && <p role="status" className="text-sm font-medium text-success">{message}</p>}

      {link?.token && url && (
        <div className="grid gap-5 border-t border-border pt-5 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="min-w-0 space-y-3">
            <p className="text-base">Expires <time dateTime={link.expiresAt}>{formatDateTimeKolkata(link.expiresAt)} IST</time></p>
            <label htmlFor="client-share-url" className="sr-only">Client link</label>
            <input id="client-share-url" readOnly value={url} className="min-h-11 w-full rounded-radius-md border border-border bg-bg px-3 text-sm text-ink" />
            <div className="flex flex-wrap gap-2">
              <button type="button" onClick={copyLink} className="min-h-11 rounded-radius-md border border-border px-4 text-sm font-semibold">Copy client link</button>
              {qrCode && <a href={qrCode} download={`event-${eventId}-client-qr.png`} className="inline-flex min-h-11 items-center rounded-radius-md border border-border px-4 text-sm font-semibold">Download Client QR PNG</a>}
              <button type="button" onClick={handleRevoke} disabled={pending} className="min-h-11 rounded-radius-md border border-danger/40 px-4 text-sm font-semibold text-danger hover:bg-danger-light disabled:opacity-50">Revoke client link</button>
            </div>
          </div>
          {qrCode && <div className="w-fit rounded-radius-md border border-border bg-white p-3"><Image src={qrCode} width={220} height={220} alt="QR code for the client event link" unoptimized /></div>}
        </div>
      )}
    </section>
  );
}
