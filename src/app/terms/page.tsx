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
    <article className="mx-auto max-w-[70ch] px-5 pb-20 pt-32 sm:px-8">
      <p className="mb-5 text-base text-ink-muted">
        Draft for client review
      </p>
      <h1 className="break-words text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em] text-ink">Terms</h1>
      <div className="mt-8 space-y-8 text-base leading-8 text-ink-muted">
        <p>
          This draft is for review by {site.name} before publication. A signed
          event agreement, if any, governs the services, scope, schedule,
          cancellation terms, and fees for that event.
        </p>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Using this website</h2>
          <p>
            Website information is general and does not itself create an event
            booking. Please provide accurate information when submitting an
            enquiry. Do not attempt to access administrator accounts, private
            files, or another person’s event information.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Private event links</h2>
          <p>
            Event links are intended for invited recipients and can expire or
            be revoked by the administrator. Anyone who receives an active link
            may be able to view its event details and finalized designs. Keep
            the link private and contact the event administrator if it is
            shared unintentionally.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold text-ink">Contact</h2>
          <p>
            Use the website contact form for questions about these draft terms.
            The client should review and replace this draft with approved terms
            and current business contact details before launch.
          </p>
        </section>
      </div>
    </article>
  );
}
