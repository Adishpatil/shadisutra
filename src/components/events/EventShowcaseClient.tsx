"use client";

import { useState, useEffect } from "react";
import { site } from "@/config/site";

interface EventShowcaseClientProps {
  event: {
    id: string;
    name: string;
    type: "wedding" | "birthday" | "function";
    date: string;
    venue: string;
    status: string;
    customer_name?: string;
    functions: Array<{
      id: string;
      name: string;
      date: string;
      start_time: string | null;
      notes: string | null;
    }>;
  };
}

export function EventShowcaseClient({ event }: EventShowcaseClientProps) {
  // RSVP / Greeting form state
  const [guestName, setGuestName] = useState("");
  const [attending, setAttending] = useState<"yes" | "no" | "tentative">("yes");
  const [guestCount, setGuestCount] = useState("1");
  const [blessingMessage, setBlessingMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Calculate countdown
  const eventDate = new Date(event.date);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffTime = eventDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const formatDisplayTime = (time: string | null) => {
    if (!time) return "Timing TBA";
    const [h, m] = time.split(":");
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? "PM" : "AM";
    const formattedHour = hour % 12 || 12;
    return `${formattedHour}:${m} ${ampm}`;
  };

  const handleRsvpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName.trim()) return;
    setSubmitted(true);
  };

  // Google Maps directions search link for the venue
  const mapsSearchUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${event.venue}`
  )}`;

  // WhatsApp share link for guests (computed safely to prevent SSR hydration mismatch)
  const [whatsappShareUrl, setWhatsappShareUrl] = useState<string>(
    `https://wa.me/?text=${encodeURIComponent(`You are invited to ${event.name}! View the schedule & venue details.`)}`
  );

  useEffect(() => {
    if (typeof window !== "undefined") {
      const shareText = `You are invited to ${event.name}! View the schedule & venue details here: ${window.location.href}`;
      setWhatsappShareUrl(`https://wa.me/?text=${encodeURIComponent(shareText)}`);
    }
  }, [event.name]);

  return (
    <div className="min-h-screen bg-bg text-ink pb-24 selection:bg-accent/20">
      {/* 1. Header Banner */}
      <header className="relative bg-surface border-b border-border py-12 px-4 sm:px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-accent-light/30 to-transparent pointer-events-none" />
        <div className="max-w-3xl mx-auto relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-radius-full bg-accent/10 border border-accent/20 text-accent text-xs font-semibold uppercase tracking-wider">
            <span>✨ Celebrations Itinerary</span>
            <span>•</span>
            <span className="capitalize">{event.type}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-heading font-bold text-ink tracking-tight">
            {event.name}
          </h1>

          {event.customer_name && (
            <p className="text-sm sm:text-base font-serif italic text-accent-ink">
              Hosted with love by {event.customer_name}
            </p>
          )}

          <div className="flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm text-ink-muted pt-2">
            <span className="inline-flex items-center gap-1.5 bg-bg px-3 py-1.5 rounded-radius-md border border-border">
              📅 {new Date(event.date).toLocaleDateString("en-IN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 bg-bg px-3 py-1.5 rounded-radius-md border border-border hover:border-accent text-ink hover:text-accent transition-colors"
            >
              📍 {event.venue} ↗
            </a>
          </div>

          {/* Countdown card */}
          {diffDays >= 0 ? (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-accent/15 border border-accent/30 rounded-radius-full text-accent font-semibold text-xs sm:text-sm">
              ⏳ <span>{diffDays === 0 ? "Celebrating Today!" : `${diffDays} days to go!`}</span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-surface border border-border rounded-radius-full text-ink-muted text-xs">
              Celebrated on {event.date}
            </div>
          )}
        </div>
      </header>

      {/* 2. Main Content Sections */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 space-y-12">
        {/* Quick Action Buttons for Guests */}
        <section className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <a
            href={mapsSearchUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-radius-lg border border-border bg-surface hover:border-accent hover:shadow-[var(--shadow-sm)] transition-all text-center min-h-[64px]"
          >
            <span className="text-xl mb-1">🗺️</span>
            <span className="text-xs font-semibold text-ink">Get Directions</span>
          </a>

          <a
            href={whatsappShareUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center justify-center p-4 rounded-radius-lg border border-border bg-surface hover:border-accent hover:shadow-[var(--shadow-sm)] transition-all text-center min-h-[64px]"
          >
            <span className="text-xl mb-1">💬</span>
            <span className="text-xs font-semibold text-ink">Share on WhatsApp</span>
          </a>

          {site.phone && site.phone !== "TODO" ? (
            <a
              href={`tel:${site.phone}`}
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-radius-lg border border-border bg-surface hover:border-accent hover:shadow-[var(--shadow-sm)] transition-all text-center min-h-[64px]"
            >
              <span className="text-xl mb-1">📞</span>
              <span className="text-xs font-semibold text-ink">Event Coordinator</span>
            </a>
          ) : (
            <a
              href="#rsvp-section"
              className="col-span-2 sm:col-span-1 flex flex-col items-center justify-center p-4 rounded-radius-lg border border-border bg-surface hover:border-accent hover:shadow-[var(--shadow-sm)] transition-all text-center min-h-[64px]"
            >
              <span className="text-xl mb-1">💌</span>
              <span className="text-xs font-semibold text-ink">Send Wishes</span>
            </a>
          )}
        </section>

        {/* Timeline & Sub-Events Itinerary */}
        <section className="space-y-6">
          <div className="border-b border-border pb-3">
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              Schedule &amp; Ceremonies
            </span>
            <h2 className="text-2xl font-heading font-bold text-ink mt-0.5">
              Celebrations Itinerary
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Here is the planned order of ceremonies and functions. Please arrive on time to join the joy!
            </p>
          </div>

          {event.functions.length === 0 ? (
            <div className="p-8 text-center bg-surface border border-dashed border-border rounded-radius-lg text-ink-muted text-sm">
              The detailed schedule for this celebration will be published shortly.
            </div>
          ) : (
            <div className="relative border-l-2 border-accent/30 ml-4 sm:ml-6 space-y-8 py-2">
              {event.functions.map((f, idx) => (
                <div key={f.id} className="relative pl-6 sm:pl-8 group">
                  {/* Timeline bullet */}
                  <div className="absolute -left-[9px] top-1.5 w-4 h-4 rounded-full bg-accent border-2 border-bg ring-4 ring-accent/15 group-hover:scale-125 transition-transform" />

                  <div className="bg-surface border border-border rounded-radius-lg p-5 shadow-[var(--shadow-sm)] hover:border-accent/40 transition-all space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-4">
                      <span className="text-xs font-bold text-accent tracking-wider uppercase">
                        Ceremony {idx + 1}
                      </span>
                      <div className="flex items-center gap-2 text-xs font-medium text-ink-muted">
                        <span>📅 {f.date}</span>
                        <span>•</span>
                        <span className="font-semibold text-ink">⏰ {formatDisplayTime(f.start_time)}</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-heading font-bold text-ink">
                      {f.name}
                    </h3>

                    {f.notes && (
                      <p className="text-xs sm:text-sm text-ink-muted leading-relaxed whitespace-pre-line border-t border-border/60 pt-2.5">
                        {f.notes}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Venue Information card */}
        <section className="bg-surface border border-border rounded-radius-lg p-6 sm:p-8 space-y-4 shadow-[var(--shadow-sm)]">
          <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
            Venue &amp; Logistics
          </span>
          <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink">
            {event.venue}
          </h2>
          <p className="text-xs sm:text-sm text-ink-muted leading-relaxed">
            Valet parking and hospitality desks will be operational at the entrance. If you need any assistance upon arrival, our event coordinators are on hand to guide you.
          </p>
          <div className="pt-2">
            <a
              href={mapsSearchUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-accent text-accent-ink rounded-radius-md text-xs sm:text-sm font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
            >
              <span>🧭 Open in Google Maps</span>
            </a>
          </div>
        </section>

        {/* Guest RSVP & Warm Wishes Form */}
        <section id="rsvp-section" className="bg-surface border border-border rounded-radius-lg p-6 sm:p-8 space-y-6 shadow-[var(--shadow-sm)]">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-widest text-accent">
              RSVP &amp; Blessings
            </span>
            <h2 className="text-xl sm:text-2xl font-heading font-bold text-ink mt-0.5">
              Confirm Attendance &amp; Send Wishes
            </h2>
            <p className="text-xs sm:text-sm text-ink-muted mt-1">
              Help the family prepare for your arrival or leave a warm congratulatory message.
            </p>
          </div>

          {submitted ? (
            <div className="p-6 bg-success/10 border border-success/30 rounded-radius-md text-center space-y-2">
              <span className="text-3xl">🎉</span>
              <h3 className="text-base font-bold text-ink font-heading">
                Thank You, {guestName}!
              </h3>
              <p className="text-xs text-ink-muted">
                Your response and warm blessing have been recorded for the hosts.
              </p>
            </div>
          ) : (
            <form onSubmit={handleRsvpSubmit} className="space-y-4">
              <div>
                <label htmlFor="guest-name" className="block text-xs font-semibold text-ink mb-1">
                  Your Full Name <span className="text-danger">*</span>
                </label>
                <input
                  id="guest-name"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="e.g. Ramesh & Sunita Verma"
                  className="w-full px-3.5 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="guest-attending" className="block text-xs font-semibold text-ink mb-1">
                    Will you attend?
                  </label>
                  <select
                    id="guest-attending"
                    value={attending}
                    onChange={(e) => setAttending(e.target.value as "yes" | "no" | "tentative")}
                    className="w-full px-3 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent min-h-[44px]"
                  >
                    <option value="yes">Joyfully Attending 🎊</option>
                    <option value="tentative">Tentative / Might attend</option>
                    <option value="no">Regretfully Decline</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="guest-count" className="block text-xs font-semibold text-ink mb-1">
                    Number of Guests (Party Size)
                  </label>
                  <input
                    id="guest-count"
                    type="number"
                    min="1"
                    max="10"
                    value={guestCount}
                    onChange={(e) => setGuestCount(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="blessing-message" className="block text-xs font-semibold text-ink mb-1">
                  Warm Wishes or Note for the Hosts
                </label>
                <textarea
                  id="blessing-message"
                  rows={3}
                  value={blessingMessage}
                  onChange={(e) => setBlessingMessage(e.target.value)}
                  placeholder="Share a heartfelt message, dietary request, or blessings..."
                  className="w-full px-3 py-2.5 rounded-radius-md border border-border bg-bg text-ink text-sm focus:ring-1 focus:ring-accent"
                />
              </div>

              <button
                type="submit"
                className="w-full sm:w-auto inline-flex items-center justify-center px-6 py-3 bg-accent text-accent-ink rounded-radius-md text-xs sm:text-sm font-semibold hover:bg-accent-hover transition-colors min-h-[44px]"
              >
                Send RSVP &amp; Wishes
              </button>
            </form>
          )}
        </section>

        {/* Footer Credit & Brand Stamp */}
        <div className="pt-8 text-center text-xs text-ink-muted border-t border-border space-y-1">
          <p>
            Event Curated &amp; Managed by{" "}
            <a href="/" className="font-heading font-semibold text-accent hover:underline">
              {site.name}
            </a>
          </p>
          <p className="text-[11px]">
            For private inquiries or custom celebrations: {site.phone || "Reach us via our official website"}
          </p>
        </div>
      </main>
    </div>
  );
}
