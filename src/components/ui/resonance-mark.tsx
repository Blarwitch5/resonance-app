import Link from "next/link";

import {
  LISTENING_SIDES,
  LISTENING_TRAIL_TOP,
  listeningTrailDelayMs,
  listeningTrailFill,
  listeningTrailIndexes,
  listeningTrailLeft,
} from "@/lib/brand/listen";

const MARK_SRC = "/logo-resonance.svg";

const MARK_SIZE = {
  sm: "size-9 standalone:size-8",
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
    <div className={`inline-flex shrink-0 ${isListening ? "px-7" : ""} ${className}`.trim()} aria-hidden>
      <div className={`relative ${MARK_SIZE[size]}`}>
        <img src={MARK_SRC} alt="" className="size-full object-contain" />
        {isListening
          ? LISTENING_SIDES.flatMap((side) =>
              listeningTrailIndexes(side).map((index) => (
                <span
                  key={`${side}-${index}`}
                  className={`absolute size-[7.15%] rounded-full ${listeningTrailFill(side)} ${
                    index === 0
                      ? "motion-reduce:hidden motion-safe:listen-dot"
                      : "motion-reduce:opacity-60 motion-safe:listen-dot"
                  }`}
                  style={{
                    left: listeningTrailLeft(side, index),
                    top: LISTENING_TRAIL_TOP,
                    animationDelay: `${listeningTrailDelayMs(index)}ms`,
                  }}
                />
              )),
            )
          : null}
      </div>
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
