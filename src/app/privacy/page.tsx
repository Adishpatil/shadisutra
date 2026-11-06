import type { Metadata } from "next";
import { pageMetadata } from "@/config/seo";
import { site } from "@/config/site";
import { Section } from "@/components/ui/Section";

export const metadata: Metadata = pageMetadata(
  "Privacy",
  `Privacy information for visitors and event pages provided by ${site.name}.`,
  "/privacy"
);

export default function PrivacyPage() {
  return (
    <div>
      <Section
        tone="soft"
        className="px-5 pb-8 pt-32 sm:px-8"
        aria-labelledby="privacy-title"
      >
        <div className="mx-auto max-w-[70ch]">
          <p className="mb-5 text-base text-ink-muted">Draft for client review</p>
          <h1 id="privacy-title" className="break-words text-[clamp(2.75rem,7vw,5rem)] font-semibold leading-[0.98] tracking-[-0.045em]">Privacy</h1>
        </div>
      </Section>
      <Section tone="white" className="px-5 pb-20 pt-8 sm:px-8">
      <article className="mx-auto max-w-[70ch]">
      <div className="space-y-8 text-base leading-8 text-ink-muted">
        <p>
          This draft explains how {site.name} handles information submitted
          through this website and information shown on private event pages. It
          must be reviewed and approved before publication.
        </p>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">What we collect</h2>
          <p>
            The contact form asks for your name, phone number, event type,
            preferred date, and message. If you plan an event with us, our
            administrators may also store your name and phone number, event
            details, guest names and RSVP/party-size/table information, planning
            items, payment records, and design files.
          </p>
          <p>
            A share link can display an event name, date, venue, schedule, and
            finalized designs to anyone holding the link. It does not display
            client phone numbers, guest lists, budgets, or payments. Do not
            forward a private event link to people who should not see those
            details.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Use and providers</h2>
          <p>
            We use submitted information to respond to enquiries and organize
            events. The application stores its database and files with Supabase.
            Administrator sign-in uses Supabase authentication and security
            cookies. Public event links are private-by-link, not a substitute
            for access control over information that must remain confidential.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Retention</h2>
          <p>
            Enquiries and event records remain in the system until an
            administrator deletes them; the application does not currently
            automatically delete them after a fixed period. Proposed policy for
            client review: delete enquiries that do not become bookings after 12
            months, and delete event and guest records 24 months after the event
            unless a legal, accounting, or active business need requires longer.
            This schedule is not active until the client approves it and
            implements the corresponding deletion process.
          </p>
        </section>
        <section className="space-y-3">
          <h2 className="text-2xl font-semibold">Your requests</h2>
          <p>
            To ask about, correct, or request deletion of information, use the
            contact form and describe your privacy request. The client should
            provide a monitored privacy contact before this draft is published.
          </p>
        </section>
      </div>
      </article>
      </Section>
    </div>
  );
}
