"use client";

import { useMemo, useState } from "react";
import type { AdminEnquiry } from "@/lib/admin/data";
import { formatDateTime } from "@/lib/format";
import { Badge, Card, EmptyState } from "@/components/ui/AdminPrimitives";

export function EnquiriesViewClient({ enquiries }: { enquiries: AdminEnquiry[] }) {
  const [search, setSearch] = useState("");
  const filteredEnquiries = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return enquiries;
    return enquiries.filter((enquiry) =>
      [enquiry.name, enquiry.phone, enquiry.event_type, enquiry.message].some(
        (value) => value.toLowerCase().includes(query)
      )
    );
  }, [enquiries, search]);

  return (
    <div className="space-y-6">
      <header>
        <p className="text-base font-semibold uppercase tracking-wider text-accent">
          Incoming leads
        </p>
        <h1 className="mt-1 text-3xl font-heading font-bold text-ink">Enquiries</h1>
        <p className="mt-2 text-base text-ink-muted">
          {enquiries.length} submissions received from the contact page.
        </p>
      </header>

      <label className="block">
        <span className="sr-only">Search enquiries</span>
        <input
          type="search"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search name, phone, type or message"
          className="min-h-11 w-full rounded-radius-md border border-border bg-surface px-4 text-base text-ink placeholder:text-ink-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        />
      </label>

      {filteredEnquiries.length === 0 ? (
        <EmptyState
          title={search ? "No matching enquiries" : "No enquiries yet"}
          description={
            search
              ? "Try a different search."
              : "New contact form submissions will appear here."
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredEnquiries.map((enquiry) => (
            <Card key={enquiry.id} className="space-y-4 p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h2 className="break-words text-xl font-heading font-bold text-ink">
                    {enquiry.name}
                  </h2>
                  <p className="mt-1 text-base text-ink-muted">
                    Received {formatDateTime(enquiry.created_at)}
                  </p>
                </div>
                <Badge variant="accent">{enquiry.event_type}</Badge>
              </div>

              {enquiry.event_date && (
                <p className="text-base text-ink-muted">
                  Requested date:{" "}
                  <strong className="text-ink">{enquiry.event_date}</strong>
                </p>
              )}

              <p className="whitespace-pre-wrap break-words text-base leading-relaxed text-ink">
                {enquiry.message}
              </p>

              <div className="grid grid-cols-2 gap-3 border-t border-border pt-3">
                <a
                  href={`tel:${enquiry.phone}`}
                  className="inline-flex min-h-11 items-center justify-center rounded-radius-md border border-border px-3 text-base font-semibold text-ink hover:border-accent hover:text-accent"
                >
                  Call
                </a>
                <a
                  href={`https://wa.me/${enquiry.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-11 items-center justify-center rounded-radius-md bg-success px-3 text-base font-semibold text-white hover:brightness-95"
                >
                  WhatsApp
                </a>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
