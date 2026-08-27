"use client";

import { useEffect, useState } from "react";

import { formatRingClasses } from "@/components/ui/format-icon";
import type { MediaFormat } from "@/lib/collection/types";

interface ArrivalWaveProps {
  format: MediaFormat;
  title: string;
}

export function ArrivalWave({ format, title }: ArrivalWaveProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      const url = new URL(window.location.href);

      if (url.searchParams.has("wave")) {
        url.searchParams.delete("wave");
        const search = url.searchParams.toString();
        window.history.replaceState(null, "", `${url.pathname}${search.length > 0 ? `?${search}` : ""}`);
      }

      setIsVisible(false);
    }, 1600);

    return () => window.clearTimeout(timeout);
  }, []);

  if (!isVisible) {
    return null;
  }

  const ring = formatRingClasses[format];

  return (
    <div
      className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center"
      aria-live="polite"
    >
      <p className="sr-only">{`${title} joined your resonance.`}</p>
      <div className="relative size-44" aria-hidden>
        {[0, 150, 300].map((delayMs) => (
          <span
            key={delayMs}
            className={`absolute inset-0 rounded-full border-2 motion-reduce:hidden motion-safe:arrival-wave ${ring}`}
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
    </div>
  );
}
