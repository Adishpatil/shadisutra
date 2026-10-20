"use client";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body>
        <main
          style={{
            minHeight: "100dvh",
            display: "grid",
            placeContent: "center",
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            color: "#1C1A17",
          }}
        >
          <h1>Something went wrong</h1>
          <p>We could not complete this request. Please try again.</p>
          <button
            type="button"
            onClick={reset}
            style={{ minHeight: 44, padding: "0.5rem 1rem" }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  );
}
