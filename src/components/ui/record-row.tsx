import { CircleDot, Music } from "lucide-react";
import Link from "next/link";

import { ChipLink } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { formatIcons, formatLabels } from "@/components/ui/format-icon";
import { ShelfThreadLine } from "@/components/ui/shelf-thread";
import type { ShelfCardThreadView } from "@/lib/collection/shelf-threads";
import type { MediaFormat } from "@/lib/collection/types";

interface RecordRowProps {
  href: string;
  coverUrl: string | null;
  title: string;
  artist: string;
  year?: number | null;
  foundOn?: string;
  format: MediaFormat;
  memory?: string;
  threads?: ShelfCardThreadView | null;
}

export function RecordRow({
  href,
  coverUrl,
  title,
  artist,
  year = null,
  foundOn,
  format,
  memory,
  threads = null,
}: RecordRowProps) {
  const FormatGlyph = formatIcons[format];
  const artistThread = threads?.artist ?? { label: artist, href: null, ariaLabel: null };
  const yearThread =
    threads?.year ?? (foundOn || year ? { label: foundOn ?? String(year), href: null, ariaLabel: null } : null);
  const formatHref = threads?.format?.href;
  const formatAria = threads?.format?.ariaLabel;

  return (
    <div className="flex min-h-14 items-center gap-3 rounded-rs-md py-1">
      <Link
        href={href}
        data-record-link=""
        className="w-16 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <CoverArt url={coverUrl} alt={`Cover of ${title} by ${artist}`} sizes="64px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={href}
          className="truncate text-sm leading-snug font-semibold text-text outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          {title}
        </Link>
        {artistThread ||
        yearThread ||
        threads?.decade ||
        threads?.label ||
        threads?.found ||
        threads?.foundWhen ? (
          <ShelfThreadLine
            threads={[
              artistThread,
              yearThread,
              threads?.decade,
              threads?.label,
              threads?.found,
              threads?.foundWhen,
            ]}
            className="text-xs leading-5 text-text-secondary"
          />
        ) : null}
        {threads?.genre ? (
          <ChipLink href={threads.genre.href} isActive={false} aria-label={threads.genre.ariaLabel}>
            <Music className="size-4 shrink-0" aria-hidden />
            {threads.genre.label}
          </ChipLink>
        ) : null}
        {threads?.condition ? (
          <ChipLink href={threads.condition.href} isActive={false} aria-label={threads.condition.ariaLabel}>
            <CircleDot className="size-4 shrink-0" aria-hidden />
            {threads.condition.label}
          </ChipLink>
        ) : null}
        {memory ? <p className="truncate text-xs leading-5 text-text-tertiary">{memory}</p> : null}
      </div>
      {formatHref && formatAria ? (
        <Link
          href={formatHref}
          aria-label={formatAria}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          <FormatGlyph className="size-4 text-text-tertiary" aria-hidden />
        </Link>
      ) : (
        <>
          <FormatGlyph className="size-4 shrink-0 text-text-tertiary" aria-hidden />
          <span className="sr-only">{formatLabels[format]}</span>
        </>
      )}
    </div>
  );
}
