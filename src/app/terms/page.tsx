import type { Metadata } from "next";
import { pageMetadata } from "@/config/seo";
import { site } from "@/config/site";

export const metadata: Metadata = pageMetadata(
  "Terms",
  `Website and event-link terms for ${site.name}.`,
  "/terms"
);

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 pb-20 pt-28 sm:px-6">
      <p className="mb-4 inline-flex rounded-full border border-accent/40 px-4 py-2 text-sm font-semibold text-ink">
        Draft for client review
      </p>
      <h1 className="font-heading text-4xl font-bold text-ink">Terms</h1>
      <div className="mt-8 space-y-6 text-base leading-7 text-ink-muted">
        <p>
          This draft is for review by {site.name} before publication. A signed
          event agreement, if any, governs the services, scope, schedule,
          cancellation terms, and fees for that event.
        </p>
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink">Using this website</h2>
          <p>
            Website information is general and does not itself create an event
            booking. Please provide accurate information when submitting an
            enquiry. Do not attempt to access administrator accounts, private
            files, or another person’s event information.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink">Private event links</h2>
          <p>
            Event links are intended for invited recipients and can expire or
            be revoked by the administrator. Anyone who receives an active link
            may be able to view its event details and finalized designs. Keep
            the link private and contact the event administrator if it is
            shared unintentionally.
          </p>
        </section>
        <section>
          <h2 className="font-heading text-2xl font-bold text-ink">Contact</h2>
          <p>
            Use the website contact form for questions about these draft terms.
            The client should review and replace this draft with approved terms
            and current business contact details before launch.
          </p>
        </section>
      </div>
    </div>
  );
}
