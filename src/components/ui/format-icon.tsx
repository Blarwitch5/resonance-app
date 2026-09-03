"use client";

import Link from "next/link";

import { formatChipClasses, formatIcons } from "@/components/ui/format-tokens";
import { useT } from "@/components/locale-provider";
import type { MediaFormat } from "@/lib/collection/types";

export {
  formatChipClasses,
  formatFillClasses,
  formatIcons,
  formatLabels,
  formatRingClasses,
  formatSwatchClasses,
} from "@/components/ui/format-tokens";

interface FormatIconProps {
  format: MediaFormat;
  href?: string;
  "aria-label"?: string;
}

export function FormatIcon({ format, href, "aria-label": ariaLabel }: FormatIconProps) {
  const t = useT();
  const Icon = formatIcons[format];
  const className = `inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium tracking-wide uppercase ${formatChipClasses[format]}`;
  const inner = (
    <>
      <Icon className="size-3.5 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
      {t(`format.${format}`)}
    </>
  );

  if (!href) {
    return <span className={className}>{inner}</span>;
  }

  return (
    <Link
      href={href}
      aria-label={ariaLabel ?? t("thread.hearOnShelf", { name: t(`format.${format}`) })}
      className={`group ${className} min-h-11 px-4 outline-none focus-visible:ring-2 focus-visible:ring-border-strong`}
    >
      {inner}
    </Link>
  );
}
