import type { ReactNode } from "react";

interface VinylPlatterProps {
  children: ReactNode;
}

export function VinylPlatter({ children }: VinylPlatterProps) {
  return (
    <div className="relative mx-auto grid aspect-square w-full max-w-88 place-items-center">
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden rounded-full bg-vinyl/15 motion-safe:vinyl-turn"
      >
        <span className="absolute -top-12 left-1/4 size-32 rounded-full bg-surface-elevated/50" />
      </span>
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[8%] rounded-full border border-dashed border-vinyl/40 motion-safe:vinyl-turn"
      />
      <span
        aria-hidden
        className="pointer-events-none absolute inset-[16%] rounded-full border border-dashed border-vinyl/25 motion-safe:vinyl-turn"
      />
      <span aria-hidden className="pointer-events-none absolute inset-[28%] rounded-full bg-primary-soft" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
