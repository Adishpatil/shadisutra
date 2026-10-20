"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-ink">Something went wrong</h1>
      <p className="mt-3 text-base text-ink-muted">
        We could not complete this request. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-radius-full bg-accent px-6 font-semibold text-accent-ink hover:bg-accent-hover"
      >
        Try again
      </button>
    </section>
  );
}
