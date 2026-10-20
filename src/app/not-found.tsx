import Link from "next/link";

export default function NotFound() {
  return (
    <section className="mx-auto flex min-h-[70dvh] max-w-2xl flex-col items-center justify-center px-4 py-12 text-center">
      <h1 className="text-3xl font-bold text-ink">Page not found</h1>
      <p className="mt-3 text-base text-ink-muted">
        The page you requested is unavailable or may have moved.
      </p>
      <Link
        href="/"
        className="mt-6 inline-flex min-h-11 items-center justify-center rounded-radius-full bg-accent px-6 font-semibold text-accent-ink hover:bg-accent-hover"
      >
        Return home
      </Link>
    </section>
  );
}
