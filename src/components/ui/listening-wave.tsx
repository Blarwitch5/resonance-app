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
          ? "flex flex-col items-center justify-end gap-2 py-2"
          : "flex flex-col items-center justify-center gap-3"
      }
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
