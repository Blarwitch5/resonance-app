import Link from "next/link";
import type { ReactNode } from "react";

import { CoverArt } from "@/components/ui/cover-art";
import { PressingText } from "@/components/ui/pressing-text";
import { formatIcons } from "@/components/ui/format-tokens";
import { ShelfThread, ShelfThreadLine } from "@/components/ui/shelf-thread";
import { hintClass, metaClass, recordTitleClass } from "@/components/ui/type";
import { shelfCardDetails, type ShelfCardThread, type ShelfCardThreadView } from "@/lib/collection/shelf-threads";
import type { MediaFormat } from "@/lib/collection/types";
import { coverAlt, formatLabel } from "@/lib/i18n/labels";
import type { Locale } from "@/lib/settings/types";

interface RecordTileProps {
  href: string;
  coverUrl: string | null;
  title: string;
  artist: string;
  year?: number | string | null;
  format?: MediaFormat | null;
  sizes?: string;
  threads?: ShelfCardThreadView | null;
  locale?: Locale;
  priority?: boolean;
}

export function RecordTile({
  href,
  coverUrl,
  title,
  artist,
  year = null,
  format = null,
  sizes,
  threads = null,
  locale = "en",
  priority = false,
}: RecordTileProps) {
  const artistThread = threads?.artist ?? { label: artist, href: null, ariaLabel: null };
  const yearThread = threads?.year ?? toYearThread(year);

  return (
    <div className="flex flex-col gap-2">
      <Link
        href={href}
        data-record-link=""
        className="group block rounded-rs-md outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <CoverArt
          url={coverUrl}
          alt={coverAlt(locale, title, artist)}
          sizes={sizes}
          priority={priority}
          isInteractive
        />
      </Link>
      <RecordTileCaption
        heading={
          <Link
            href={href}
            className={`line-clamp-2 w-fit max-w-full ${recordTitleClass} outline-none focus-visible:ring-2 focus-visible:ring-border-strong`}
          >
            <PressingText>{title}</PressingText>
          </Link>
        }
        format={format}
        formatName={format ? formatLabel(locale, format) : null}
        artist={artistThread}
        details={shelfCardDetails(threads, yearThread)}
      />
    </div>
  );
}

interface RecordTileCaptionProps {
  heading: ReactNode;
  format?: MediaFormat | null;
  formatName?: string | null;
  artist: ShelfCardThread | null;
  details: Array<ShelfCardThread | null | undefined>;
}

export function RecordTileCaption({
  heading,
  format = null,
  formatName = null,
  artist,
  details,
}: RecordTileCaptionProps) {
  const FormatGlyph = format ? formatIcons[format] : null;

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="flex items-start gap-2">
        <div className="min-w-0">{heading}</div>
        {FormatGlyph ? (
          <span className="mt-0.5 inline-flex shrink-0 text-text-tertiary">
            <FormatGlyph className="size-3.5" aria-hidden />
            {formatName ? <span className="sr-only">{formatName}</span> : null}
          </span>
        ) : null}
      </div>
      {artist ? (
        <ShelfThread thread={artist} compact className={`truncate ${metaClass}`} />
      ) : null}
      <ShelfThreadLine compact threads={details} className={hintClass} />
    </div>
  );
}

function toYearThread(year: number | string | null): { label: string; href: null; ariaLabel: null } | null {
  if (year === null || year === "") {
    return null;
  }

  return { label: String(year), href: null, ariaLabel: null };
}
