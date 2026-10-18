import { getAdminEnquiries } from "@/lib/admin/data";

export default async function AdminEnquiriesPage() {
  const enquiries = await getAdminEnquiries();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <span className="text-xs uppercase tracking-widest text-accent font-semibold">
          Incoming Leads
        </span>
        <h1 className="text-2xl sm:text-3xl font-heading font-bold text-ink mt-1">
          Website Enquiries ({enquiries.length})
        </h1>
        <p className="text-xs sm:text-sm text-ink-muted mt-1">
          Submissions received from the public contact page. Tap WhatsApp or Call to reply immediately.
        </p>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 1. Desktop & Tablet List (Hidden on mobile <768px)            */}
      {/* ------------------------------------------------------------- */}
      <div className="hidden md:block bg-surface border border-border rounded-radius-lg shadow-[var(--shadow-sm)] divide-y divide-border">
        {enquiries.map((enq) => (
          <div key={enq.id} className="p-6 hover:bg-bg/30 transition-colors space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <h3 className="font-heading font-bold text-lg text-ink">
                  {enq.name}
                </h3>
                <span className="text-xs uppercase font-bold text-accent px-2 py-0.5 rounded-radius-full bg-accent-light">
                  {enq.event_type}
                </span>
                {enq.event_date && (
                  <span className="text-xs text-ink-muted">
                    Target Date: <strong>{enq.event_date}</strong>
                  </span>
                )}
              </div>

              <div className="flex items-center gap-3">
                <a
                  href={`tel:${enq.phone}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-ink border border-border hover:border-accent hover:text-accent rounded-radius-md transition-colors min-h-[36px]"
                >
                  📞 Call
                </a>
                <a
                  href={`https://wa.me/${enq.phone.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#25D366] hover:bg-[#20ba59] rounded-radius-md transition-colors min-h-[36px]"
                >
                  💬 WhatsApp
                </a>
              </div>
            </div>

            <p className="text-sm text-ink-muted leading-relaxed bg-bg/50 p-4 rounded-radius-md border border-border">
              &ldquo;{enq.message}&rdquo;
            </p>

            <div className="flex items-center justify-between text-xs text-ink-muted font-mono">
              <span>Phone: {enq.phone}</span>
              <span>Received: {new Date(enq.created_at).toLocaleString()}</span>
            </div>
          </div>
        ))}

        {enquiries.length === 0 && (
          <div className="p-12 text-center text-ink-muted text-sm">
            No enquiries received yet.
          </div>
        )}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* 2. Mobile Stacked Cards (Visible only below 768px)            */}
      {/* ------------------------------------------------------------- */}
      <div className="md:hidden space-y-4">
        {enquiries.map((enq) => (
          <div
            key={enq.id}
            className="bg-surface p-5 rounded-radius-lg border border-border shadow-[var(--shadow-sm)] space-y-3"
          >
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold text-accent px-1.5 py-0.5 rounded-radius-sm bg-accent-light inline-block mb-1">
                  {enq.event_type}
                </span>
                <h3 className="font-heading font-bold text-base text-ink">
                  {enq.name}
                </h3>
              </div>
              <span className="text-xs font-mono text-ink-muted">
                {enq.phone}
              </span>
            </div>

            {enq.event_date && (
              <p className="text-xs text-ink-muted">
                📅 Target Date: <strong>{enq.event_date}</strong>
              </p>
            )}

            <p className="text-xs text-ink-muted leading-relaxed bg-bg/60 p-3 rounded-radius-md border border-border">
              &ldquo;{enq.message}&rdquo;
            </p>

            <div className="pt-2 border-t border-border flex items-center justify-between gap-2">
              <a
                href={`tel:${enq.phone}`}
                className="flex-1 inline-flex items-center justify-center py-2.5 text-xs font-semibold text-ink border border-border rounded-radius-md min-h-[44px]"
              >
                📞 Call
              </a>
              <a
                href={`https://wa.me/${enq.phone.replace(/\D/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center py-2.5 text-xs font-semibold text-white bg-[#25D366] rounded-radius-md min-h-[44px]"
              >
                💬 WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
