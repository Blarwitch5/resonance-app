import Link from "next/link";

import { hintClass } from "@/components/ui/type";

export interface DonutSegment {
  key: string;
  label: string;
  count: number;
  fillClass: string;
  swatchClass: string;
  href?: string;
  ariaLabel?: string;
}

interface DonutChartProps {
  segments: DonutSegment[];
  total: number;
  caption: string;
  unit: string;
}

const VIEW = 100;
const CENTER = 50;
const OUTER = 40;
const INNER = 24;
const GAP = 2;

export function DonutChart({ segments, total, caption, unit }: DonutChartProps) {
  const slices = toSlices(segments, total);

  if (slices.length < 2 || total === 0) {
    return null;
  }

  return (
    <figure className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-6">
      <figcaption className="sr-only">{caption}</figcaption>
      <div className="relative size-36 shrink-0">
        <svg viewBox={`0 0 ${VIEW} ${VIEW}`} className="size-full" aria-hidden>
          {slices.map((slice) => (
            <path key={slice.key} d={slice.path} className={slice.fillClass} />
          ))}
        </svg>
        <p className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
          <span className="text-lg font-semibold text-text">{total}</span>
          <span className={hintClass}>{unit}</span>
        </p>
      </div>
      <ul className="flex w-full flex-col gap-3">
        {slices.map((slice) => {
          const row = (
            <>
              <span className="flex min-w-0 items-center gap-2 text-text">
                <span className={`size-2.5 shrink-0 rounded-full ${slice.swatchClass}`} aria-hidden />
                <span className="truncate">{slice.label}</span>
              </span>
              <span className="shrink-0 tabular-nums text-text-secondary">{slice.count}</span>
            </>
          );

          if (!slice.href) {
            return (
              <li key={slice.key} className="flex items-center justify-between gap-3 px-3 text-sm">
                {row}
              </li>
            );
          }

          return (
            <li key={slice.key}>
              <Link
                href={slice.href}
                aria-label={slice.ariaLabel}
                className="flex min-h-11 items-center justify-between gap-3 rounded-rs-sm px-3 text-sm outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
              >
                {row}
              </Link>
            </li>
          );
        })}
      </ul>
    </figure>
  );
}

interface Slice extends DonutSegment {
  path: string;
}

function toSlices(segments: DonutSegment[], total: number): Slice[] {
  const visible = segments.filter((segment) => segment.count > 0);

  if (visible.length < 2 || total === 0) {
    return [];
  }

  let cursor = 0;
  const slices: Slice[] = [];

  for (const segment of visible) {
    const sweep = (segment.count / total) * 360;
    const gap = sweep > GAP * 2 ? GAP : 0;
    const start = cursor + gap / 2;
    const end = cursor + sweep - gap / 2;
    cursor += sweep;

    slices.push({
      ...segment,
      path: donutPath(start, Math.max(end, start + 0.4)),
    });
  }

  return slices;
}

function donutPath(startAngle: number, endAngle: number): string {
  const startOuter = polar(OUTER, startAngle);
  const endOuter = polar(OUTER, endAngle);
  const startInner = polar(INNER, endAngle);
  const endInner = polar(INNER, startAngle);
  const large = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${OUTER} ${OUTER} 0 ${large} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${startInner.x} ${startInner.y}`,
    `A ${INNER} ${INNER} 0 ${large} 0 ${endInner.x} ${endInner.y}`,
    "Z",
  ].join(" ");
}

function polar(radius: number, angleDeg: number) {
  const radians = ((angleDeg - 90) * Math.PI) / 180;

  return {
    x: round(CENTER + radius * Math.cos(radians)),
    y: round(CENTER + radius * Math.sin(radians)),
  };
}

function round(value: number) {
  return Number(value.toFixed(3));
}
