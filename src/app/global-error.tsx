"use client";

import { Section } from "@/components/ui/Section";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main>
          <Section
            tone="soft"
            className="global-error-page"
            aria-labelledby="global-error-heading"
          >
            <h1 id="global-error-heading">Something went wrong</h1>
            <p>We could not complete this request. Please try again.</p>
            <button type="button" onClick={reset}>
              Try again
            </button>
          </Section>
        </main>
      </body>
    </html>
  );
}
