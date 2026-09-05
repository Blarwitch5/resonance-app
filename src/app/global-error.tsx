"use client";

interface GlobalErrorProps {
  retry?: () => void;
  reset?: () => void;
}

export default function GlobalError({ retry, reset }: GlobalErrorProps) {
  const onRetry = retry ?? reset ?? (() => window.location.reload());

  return (
    <html lang="en">
      <body>
        <div style={{ minHeight: "100dvh", display: "grid", placeItems: "center", padding: "1.5rem" }}>
          <div style={{ maxWidth: "24rem", textAlign: "center" }}>
            <p>Resonance</p>
            <h1>The signal wavered.</h1>
            <p>Something quiet went wrong. Your shelf is still here.</p>
            <button type="button" onClick={() => onRetry()}>
              Try again
            </button>
          </div>
        </div>
      </body>
    </html>
  );
}
