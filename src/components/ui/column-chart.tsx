import Link from "next/link";

import { chartFillClasses, type ChartTone } from "@/components/ui/chart-tone";
import { chartShare } from "@/lib/collection/chart-scale";

export interface ColumnChartItem {
  label: string;
  count: number;
  href?: string;
  ariaLabel?: string;
}

interface ColumnChartProps {
  items: ColumnChartItem[];
  tone?: ChartTone;
}

export function ColumnChart({ items, tone = "vinyl" }: ColumnChartProps) {
  const peak = Math.max(0, ...items.map((item) => item.count));

  if (items.length === 0 || peak === 0) {
    return null;
  }

  return (
    <ul className="-mx-1 flex gap-1 overflow-x-auto">
      {items.map((item) => {
        const height = chartShare(item.count, peak);
        const column = (
          <>
            <span className="text-xs tabular-nums text-text-secondary">{item.count}</span>
            <span className="flex h-28 w-full items-end justify-center">
              <span
                className={`w-5 min-h-1 rounded-t-rs-sm ${chartFillClasses[tone]}`}
                style={{ height: `${height}%` }}
                aria-hidden
              />
            </span>
            <span className="w-full truncate text-center text-xs leading-4 text-text">{item.label}</span>
          </>
        );

        if (!item.href) {
          return (
            <li key={item.label} className="flex w-11 shrink-0 flex-col items-center gap-1 px-1 py-1">
              {column}
            </li>
          );
        }

        return (
          <li key={item.label} className="w-11 shrink-0">
            <Link
              href={item.href}
              aria-label={item.ariaLabel}
              className="flex min-h-11 w-full flex-col items-center gap-1 rounded-rs-sm px-1 py-1 outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
            >
              {column}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
