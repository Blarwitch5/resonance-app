import { CassetteTape, Disc, Disc3 } from "lucide-react";
import Link from "next/link";

import { FORMAT_LABELS, type MediaFormat } from "@/lib/collection/types";

export const formatLabels = FORMAT_LABELS;

export const formatIcons: Record<MediaFormat, typeof Disc> = {
  vinyl: Disc3,
  cassette: CassetteTape,
  cd: Disc,
};

const chips: Record<MediaFormat, string> = {
  vinyl: "bg-primary-soft text-on-primary-soft",
  cassette: "bg-secondary-soft text-on-secondary-soft",
  cd: "bg-info-soft text-info",
};

export const formatFillClasses: Record<MediaFormat, string> = {
  vinyl: "fill-vinyl",
  cassette: "fill-cassette",
  cd: "fill-cd",
};

export const formatSwatchClasses: Record<MediaFormat, string> = {
  vinyl: "bg-vinyl",
  cassette: "bg-cassette",
  cd: "bg-cd",
};

export const formatRingClasses: Record<MediaFormat, string> = {
  vinyl: "border-vinyl",
  cassette: "border-cassette",
  cd: "border-cd",
};

interface FormatIconProps {
  format: MediaFormat;
  href?: string;
  "aria-label"?: string;
}

export function FormatIcon({ format, href, "aria-label": ariaLabel }: FormatIconProps) {
  const Icon = formatIcons[format];
  const className = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${chips[format]}`;
  const inner = (
    <>
      <Icon className="size-3.5 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
      {formatLabels[format]}
    </>
  );

  if (!href) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? `Hear ${formatLabels[format]} on your shelf`}
      className={`group ${className} min-h-11 px-4 outline-none focus-visible:ring-2 focus-visible:ring-border-strong`}
    >
      {inner}
    </Link>
  );
}
