"use client";

import { Section } from "@/components/ui/Section";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main>
      <Section
        tone="soft"
        className="mx-auto flex min-h-[70dvh] max-w-7xl flex-col items-start justify-center px-5 py-16 sm:px-8"
        aria-labelledby="error-heading"
      >
        <h1 id="error-heading" className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-tight tracking-[-0.04em] text-ink">
          Something went wrong
        </h1>
        <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
          We could not complete this request. Please try again.
        </p>
        <button
          type="button"
          onClick={reset}
          className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-3 font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          Try again
        </button>
      </Section>
    </main>
  );
}
