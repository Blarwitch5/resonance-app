import { sideRuntime } from "@/lib/collection/runtime";
import type { RecordSide } from "@/lib/collection/types";

interface RecordSideHeadingProps {
  side: RecordSide;
  showRuntime?: boolean;
}

export function RecordSideHeading({ side, showRuntime = true }: RecordSideHeadingProps) {
  const runtime = showRuntime ? sideRuntime(side) : null;

  if (!side.heading && !runtime) {
    return null;
  }

  return (
    <div className="flex items-baseline justify-between gap-3">
      {side.heading ? (
        <h3 className="text-xs font-medium tracking-wide text-text-tertiary uppercase">{side.heading}</h3>
      ) : (
        <span />
      )}
      {runtime ? (
        <p className="font-mono text-xs leading-5 tabular-nums text-text-tertiary">{runtime}</p>
      ) : null}
    </div>
  );
}
