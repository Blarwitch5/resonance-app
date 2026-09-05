import { PressingText } from "@/components/ui/pressing-text";
import { hintClass, kickerClass } from "@/components/ui/type";
import { sideRuntime } from "@/lib/collection/runtime";
import type { RecordSide } from "@/lib/collection/types";
import type { Locale } from "@/lib/settings/types";

interface RecordSideHeadingProps {
  side: RecordSide;
  showRuntime?: boolean;
  locale?: Locale;
}

export function RecordSideHeading({ side, showRuntime = true, locale = "en" }: RecordSideHeadingProps) {
  const runtime = showRuntime ? sideRuntime(side, locale) : null;

  if (!side.heading && !runtime) {
    return null;
  }

  return (
    <div className="flex items-baseline justify-between gap-3">
      {side.heading ? (
        <h3 className={kickerClass}>
          <PressingText>{side.heading}</PressingText>
        </h3>
      ) : (
        <span />
      )}
      {runtime ? (
        <p className={`font-mono tabular-nums ${hintClass}`}>{runtime}</p>
      ) : null}
    </div>
  );
}
