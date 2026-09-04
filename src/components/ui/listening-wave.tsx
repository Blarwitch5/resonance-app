import type { ReactNode } from "react";

import { ResonanceMark } from "@/components/ui/resonance-mark";

interface ListeningWaveProps {
  label: string;
  progress?: number;
  isActive?: boolean;
  compact?: boolean;
}

export function SectionLoader({ label }: { label: string }) {
  return (
    <div className="flex min-h-[calc(100svh-env(safe-area-inset-top)-env(safe-area-inset-bottom)-8rem-var(--rs-sample-dock,0px))] flex-1 flex-col items-center justify-center lg:min-h-[calc(100svh-env(safe-area-inset-top)-3rem-var(--rs-sample-dock,0px))]">
      <div
        className="flex flex-col items-center justify-center gap-6"
        aria-live="polite"
        aria-busy
      >
        <ResonanceMark size="lg" isListening />
        <p className="text-sm leading-6 text-text-secondary">{label}</p>
      </div>
    </div>
  );
}

export function ListenRings({ className = "border-current" }: { className?: string }) {
  return (
    <>
      {[0, 240, 480].map((delayMs) => (
        <span
          key={delayMs}
          className={`absolute inset-0 rounded-full border-2 motion-reduce:hidden motion-safe:search-wave ${className}`}
          style={{ animationDelay: `${delayMs}ms` }}
          aria-hidden
        />
      ))}
    </>
  );
}

export function ListenPulse({ className = "" }: { className?: string }) {
  return (
    <span className={`relative inline-flex size-6 shrink-0 ${className}`.trim()} aria-hidden>
      <ListenRings />
      <span className="absolute inset-[7px] rounded-full bg-current opacity-80" />
    </span>
  );
}

export function BusyGlyph({ isBusy, children }: { isBusy: boolean; children: ReactNode }) {
  return isBusy ? <ListenPulse /> : children;
}

/** Compact pull pulse: size-14 rings at listen-wave scale 1.85, plus a little air. */
export const LISTENING_WAVE_COMPACT_PX = 112;

export function ListeningWave({
  label,
  progress = 1,
  isActive = false,
  compact = false,
}: ListeningWaveProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <div
      className={
        compact
          ? "flex items-center justify-center overflow-visible"
          : "flex flex-col items-center justify-center gap-3"
      }
      style={compact ? { width: LISTENING_WAVE_COMPACT_PX, height: LISTENING_WAVE_COMPACT_PX } : undefined}
      aria-live={isActive ? "polite" : "off"}
      aria-busy={isActive}
    >
      <div
        className="relative size-14"
        aria-hidden
        style={{
          opacity: 0.25 + clamped * 0.75,
          transform: `scale(${0.55 + clamped * 0.45})`,
        }}
      >
        {[0, 400, 800].map((delayMs) => (
          <span
            key={delayMs}
            className="absolute inset-0 rounded-full border-2 border-primary motion-reduce:hidden motion-safe:listen-wave"
            style={{ animationDelay: `${delayMs}ms` }}
          />
        ))}
      </div>
      <p className={compact ? "sr-only" : "text-sm leading-6 text-text-secondary"}>{label}</p>
    </div>
  );
}
