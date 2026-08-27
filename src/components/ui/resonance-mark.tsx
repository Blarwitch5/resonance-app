import Link from "next/link";

import {
  LISTENING_TRAIL,
  LISTENING_TRAIL_LEFT,
  LISTENING_TRAIL_TOP,
  listeningTrailDelayMs,
} from "@/lib/brand/listen";

const MARK_SRC = "/logo-resonance.svg";

const MARK_SIZE = {
  sm: "size-9",
  md: "size-14",
  lg: "size-28",
} as const;

type MarkSize = keyof typeof MARK_SIZE;

interface ResonanceMarkProps {
  size?: MarkSize;
  isListening?: boolean;
  className?: string;
}

export function ResonanceMark({ size = "sm", isListening = false, className = "" }: ResonanceMarkProps) {
  return (
    <div
      className={`relative shrink-0 ${MARK_SIZE[size]} ${isListening ? "mr-[22%]" : ""} ${className}`.trim()}
      aria-hidden
    >
      <img src={MARK_SRC} alt="" className="size-full object-contain" />
      {isListening
        ? LISTENING_TRAIL.map((index) => (
            <span
              key={index}
              className={
                index === 0
                  ? "absolute size-[7.15%] rounded-full bg-secondary motion-reduce:hidden motion-safe:listen-dot"
                  : "absolute size-[7.15%] rounded-full bg-secondary motion-reduce:opacity-60 motion-safe:listen-dot"
              }
              style={{
                left: LISTENING_TRAIL_LEFT[index],
                top: LISTENING_TRAIL_TOP,
                animationDelay: `${listeningTrailDelayMs(index)}ms`,
              }}
            />
          ))
        : null}
    </div>
  );
}

interface ResonanceLockupProps {
  size?: MarkSize;
  href?: string | null;
  tagline?: string;
}

export function ResonanceLockup({
  size = "sm",
  href = "/collection",
  tagline,
}: ResonanceLockupProps) {
  const body = (
    <>
      <ResonanceMark size={size} />
      <span className="flex min-w-0 flex-col gap-1">
        <span className="text-lg font-semibold tracking-[0.18em] text-text">Resonance</span>
        {tagline ? <span className="text-sm leading-5 text-text-secondary">{tagline}</span> : null}
      </span>
    </>
  );

  if (!href) {
    return <div className="flex items-center gap-3">{body}</div>;
  }

  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-rs-sm outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      {body}
    </Link>
  );
}
