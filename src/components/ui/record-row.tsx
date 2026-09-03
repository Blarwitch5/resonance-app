import Link from "next/link";

import { CoverArt } from "@/components/ui/cover-art";
import { formatIcons } from "@/components/ui/format-tokens";
import { ShelfThreadLine } from "@/components/ui/shelf-thread";
import { hintClass, metaClass, recordTitleClass } from "@/components/ui/type";
import { shelfCardDetails, type ShelfCardThreadView } from "@/lib/collection/shelf-threads";
import type { MediaFormat } from "@/lib/collection/types";
import { coverAlt, formatLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/settings/types";

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
  locale?: Locale;
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
  locale = "en",
}: RecordRowProps) {
  const FormatGlyph = formatIcons[format];
  const artistThread = threads?.artist ?? { label: artist, href: null, ariaLabel: null };
  const yearThread =
    threads?.year ?? (foundOn || year ? { label: foundOn ?? String(year), href: null, ariaLabel: null } : null);
  const formatHref = threads?.format?.href;
  const formatAria = threads?.format?.ariaLabel;

  return (
    <div className="flex min-h-14 items-center gap-3 rounded-rs-md py-2">
      <Link
        href={href}
        data-record-link=""
        className="w-16 shrink-0 outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <CoverArt url={coverUrl} alt={coverAlt(locale, title, artist)} sizes="64px" />
      </Link>
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <Link
          href={href}
          className={`truncate ${recordTitleClass} outline-none focus-visible:ring-2 focus-visible:ring-border-strong`}
        >
          {title}
        </Link>
        <ShelfThreadLine
          compact
          threads={[artistThread, ...shelfCardDetails(threads, yearThread)]}
          className={metaClass}
        />
        {memory ? <p className={`truncate ${hintClass}`}>{memory}</p> : null}
      </div>
      {formatHref && formatAria ? (
        <Link
          href={formatHref}
          aria-label={formatAria}
          className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          <FormatGlyph className="size-3.5 text-text-tertiary" aria-hidden />
        </Link>
      ) : (
        <>
          <FormatGlyph className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
          <span className="sr-only">{formatLabel(locale, format)}</span>
        </>
      )}
    </div>
  );
}
