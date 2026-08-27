import Link from "next/link";

export interface BarListItem {
  label: string;
  count: number;
  href?: string;
  ariaLabel?: string;
}

interface BarListProps {
  items: BarListItem[];
}

export function BarList({ items }: BarListProps) {
  const peak = Math.max(0, ...items.map((item) => item.count));

  if (items.length === 0 || peak === 0) {
    return null;
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const width = Math.max(4, Math.round((item.count / peak) * 100));
        const bar = (
          <>
            <div className="flex items-baseline justify-between gap-3">
              <span className="truncate text-sm font-medium text-text">{item.label}</span>
              <span className="shrink-0 text-xs tabular-nums text-text-secondary">{item.count}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface-pressed" aria-hidden>
              <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
            </div>
          </>
        );

        if (!item.href) {
          return (
            <li key={item.label} className="flex flex-col gap-1">
              {bar}
            </li>
          );
        }

        return (
          <li key={item.label}>
            <Link
              href={item.href}
              aria-label={item.ariaLabel}
              className="flex min-h-11 flex-col justify-center gap-1 rounded-rs-sm outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
            >
              {bar}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
