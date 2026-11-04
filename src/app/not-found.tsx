import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-start justify-center px-5 py-16 sm:px-8">
      <h1 className="text-[clamp(2.5rem,7vw,4.5rem)] font-semibold leading-tight tracking-[-0.04em] text-ink">Page not found</h1>
      <p className="mt-4 max-w-xl text-base leading-relaxed text-ink-muted">
        The page you requested is unavailable or may have moved.
      </p>
      <Link
        href="/"
        className="mt-7 inline-flex min-h-11 items-center justify-center rounded-full bg-ink px-6 py-3 font-semibold text-bg transition-colors hover:bg-ink/85 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        Return home
      </Link>
    </section>
  );
}
