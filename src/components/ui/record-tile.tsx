import { CircleDot, Music } from "lucide-react";
import Link from "next/link";

import { ChipLink } from "@/components/ui/chip";
import { CoverArt } from "@/components/ui/cover-art";
import { FormatIcon } from "@/components/ui/format-icon";
import { ShelfThread, ShelfThreadLine } from "@/components/ui/shelf-thread";
import type { ShelfCardThreadView } from "@/lib/collection/shelf-threads";
import type { MediaFormat } from "@/lib/collection/types";

interface RecordTileProps {
  href: string;
  coverUrl: string | null;
  title: string;
  artist: string;
  year?: number | string | null;
  format?: MediaFormat | null;
  sizes?: string;
  threads?: ShelfCardThreadView | null;
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
}: RecordTileProps) {
  const artistThread = threads?.artist ?? { label: artist, href: null, ariaLabel: null };
  const yearThread = threads?.year ?? toYearThread(year);
  const formatHref = threads?.format?.href ?? undefined;

  return (
    <div className="flex flex-col gap-3">
      <Link
        href={href}
        data-record-link=""
        className="group flex flex-col gap-3 rounded-rs-md outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <CoverArt url={coverUrl} alt={`Cover of ${title} by ${artist}`} sizes={sizes} isInteractive />
        <p className="truncate text-sm leading-snug font-semibold text-text">{title}</p>
      </Link>
      {format ? <FormatIcon format={format} href={formatHref} /> : null}
      {artistThread ? (
        <ShelfThread thread={artistThread} className="truncate text-xs leading-5 text-text-secondary" />
      ) : null}
      {yearThread ||
      threads?.decade ||
      threads?.label ||
      threads?.found ||
      threads?.foundWhen ||
      threads?.genre ||
      threads?.condition ? (
        <div className="flex flex-wrap items-center gap-2">
          <ShelfThreadLine
            threads={[yearThread, threads?.decade, threads?.label, threads?.found, threads?.foundWhen]}
            className="text-xs leading-5 text-text-tertiary"
          />
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
        </div>
      ) : null}
    </div>
  );
}

function toYearThread(year: number | string | null): { label: string; href: null; ariaLabel: null } | null {
  if (year === null || year === "") {
    return null;
  }

  return { label: String(year), href: null, ariaLabel: null };
}
