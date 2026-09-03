import Link from "next/link";

import { chartFillClasses, chartTrackClasses, type ChartTone } from "@/components/ui/chart-tone";
import { chartMarks, chartShare } from "@/lib/collection/chart-scale";

export interface BarListItem {
  label: string;
  count: number;
  href?: string;
  ariaLabel?: string;
}

interface BarListProps {
  items: BarListItem[];
  tone?: ChartTone;
  variant?: "bar" | "marks";
}

export function BarList({ items, tone = "vinyl", variant = "bar" }: BarListProps) {
  const peak = Math.max(0, ...items.map((item) => item.count));

  if (items.length === 0 || peak === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-2">
      {items.map((item) => {
        const meter =
          variant === "marks" ? (
            <DiscMarks count={item.count} peak={peak} tone={tone} />
          ) : (
            <span className={`block h-2 overflow-hidden rounded-full ${chartTrackClasses[tone]}`} aria-hidden>
              <span
                className={`block h-full rounded-full ${chartFillClasses[tone]}`}
                style={{ width: `${chartShare(item.count, peak, 4)}%` }}
              />
            </span>
          );

        const row = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-text">{item.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-text-secondary">{item.count}</span>
            </div>
            {meter}
          </>
        );

        if (!item.href) {
          return (
            <li key={item.label} className="flex flex-col gap-1.5 px-3">
              {row}
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-label={item.ariaLabel}
              className="flex min-h-11 flex-col justify-center gap-1.5 rounded-rs-sm px-3 outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
            >
              {row}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

function DiscMarks({ count, peak, tone }: { count: number; peak: number; tone: ChartTone }) {
  const marks = chartMarks(count, peak);

  return (
    <span className="flex flex-wrap gap-1" aria-hidden>
      {Array.from({ length: marks }, (_, index) => (
        <span key={index} className={`size-2 rounded-full ${chartFillClasses[tone]}`} />
      ))}
    </span>
  );
}
