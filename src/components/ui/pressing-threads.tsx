"use client";

import { CircleDot, MapPin, Music } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ChipLink } from "@/components/ui/chip";
import { CopyPressingButton } from "@/components/ui/copy-pressing-button";
import { FormatIcon } from "@/components/ui/format-icon";
import { formatIcons } from "@/components/ui/format-tokens";
import { PressingLinks } from "@/components/ui/pressing-links";
import { displayTitleClass } from "@/components/ui/type";
import { useT } from "@/components/locale-provider";
import type { PressingThreadView } from "@/lib/collection/pressing-threads";
import type { Locale } from "@/lib/settings/types";

interface PressingArtistProps {
  name: string;
  href: string | null;
}

export function PressingArtist({ name, href }: PressingArtistProps) {
  const t = useT();

  if (!href) {
    return <p className="text-base leading-6 text-text-secondary">{name}</p>;
  }

  return (
    <Link
      href={href}
      aria-label={t("thread.hearOnShelf", { name })}
      className="inline-flex min-h-11 items-center text-base leading-6 text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      {name}
    </Link>
  );
}

interface PressingThreadsProps {
  threads: PressingThreadView;
  title?: string;
  titleClassName?: string;
  showArtist?: boolean;
  showLinks?: boolean;
  locale?: Locale;
}

export function PressingThreads({
  threads,
  title,
  titleClassName = displayTitleClass,
  showArtist = false,
  showLinks = false,
  locale,
}: PressingThreadsProps) {
  const t = useT();
  const hasChips = threads.genres.length > 0 || threads.condition !== null;
  const FormatGlyph = formatIcons[threads.format];

  return (
    <>
      <FormatIcon format={threads.format} href={threads.formatHref} />
      {title || showArtist ? (
        <div className="flex flex-col gap-1">
          {title ? <h1 className={titleClassName}>{title}</h1> : null}
          {showArtist ? <PressingArtist name={threads.artist} href={threads.artistHref} /> : null}
        </div>
      ) : null}
      <div className="flex flex-col gap-1">
        <p className="flex flex-wrap items-center gap-x-2 text-sm leading-6 text-text-secondary">
          {threads.yearHref && threads.yearAria ? (
            <ThreadLink href={threads.yearHref} ariaLabel={threads.yearAria}>
              {threads.year}
            </ThreadLink>
          ) : (
            <span className="inline-flex min-h-11 items-center">
              {threads.year ? `${threads.year}` : t("thread.yearUnknown")}
            </span>
          )}
          {threads.decade ? (
            <>
              <Dot />
              <ThreadLink href={threads.decade.href} ariaLabel={threads.decade.ariaLabel}>
                {threads.decade.label}
              </ThreadLink>
            </>
          ) : null}
          {threads.label ? (
            <>
              <Dot />
              {threads.labelHref ? (
                <ThreadLink href={threads.labelHref} ariaLabel={t("thread.hearOnShelf", { name: threads.label })}>
                  {threads.label}
                </ThreadLink>
              ) : (
                <span>{threads.label}</span>
              )}
            </>
          ) : null}
          {threads.country ? (
            <>
              <Dot />
              <span>{threads.country}</span>
            </>
          ) : null}
        </p>
        {threads.formatLine ? (
          <p className="flex items-center gap-2 text-sm leading-6 text-text-secondary">
            <FormatGlyph className="size-4 shrink-0" aria-hidden />
            <span>{threads.formatLine}</span>
          </p>
        ) : null}
        {threads.creditLine ? (
          <p className="text-sm leading-6 text-text-secondary">{threads.creditLine}</p>
        ) : null}
        {hasChips ? (
          <ul className="flex flex-wrap gap-2">
            {threads.genres.map((genre) => (
              <li key={genre.name}>
                <ChipLink href={genre.href} isActive={false}>
                  <Music className="size-4 shrink-0" aria-hidden />
                  {genre.name}
                </ChipLink>
              </li>
            ))}
            {threads.condition ? (
              <li>
                <ChipLink
                  href={threads.condition.href}
                  isActive={false}
                  aria-label={threads.condition.ariaLabel}
                >
                  <CircleDot className="size-4 shrink-0" aria-hidden />
                  {threads.condition.label}
                </ChipLink>
              </li>
            ) : null}
          </ul>
        ) : null}
        {threads.catalogNumber ? <CopyPressingButton kind="catalog" value={threads.catalogNumber} /> : null}
        {threads.barcode ? <CopyPressingButton kind="barcode" value={threads.barcode} /> : null}
        {threads.found ? (
          <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-6 text-text-secondary">
            <MapPin className="size-3.5 shrink-0" aria-hidden />
            {threads.found.href ? (
              <ThreadLink
                href={threads.found.href}
                ariaLabel={t("thread.hearFound", { place: threads.found.where })}
              >
                {threads.found.where}
              </ThreadLink>
            ) : (
              <span className="inline-flex min-h-11 items-center">{threads.found.where}</span>
            )}
            {threads.found.when ? (
              threads.found.whenHref ? (
                <>
                  <span aria-hidden>·</span>
                  <ThreadLink
                    href={threads.found.whenHref}
                    ariaLabel={t("thread.hearFound", { place: threads.found.when.slice(0, 4) })}
                  >
                    {threads.found.when}
                  </ThreadLink>
                </>
              ) : (
                <span>· {threads.found.when}</span>
              )
            ) : null}
          </p>
        ) : null}
        {showLinks ? (
          <PressingLinks
            href={threads.discogs?.href}
            releaseId={threads.discogs?.id}
            title={threads.title}
            artist={threads.artist}
            elsewhereHref={threads.elsewhereHref}
            locale={locale}
          />
        ) : null}
      </div>
    </>
  );
}

export function ThreadLink({
  href,
  ariaLabel,
  children,
  compact = false,
}: {
  href: string;
  ariaLabel: string;
  children: ReactNode;
  compact?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-label={ariaLabel}
      className={
        compact
          ? "inline outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
          : "inline-flex min-h-11 items-center outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      }
    >
      {children}
    </Link>
  );
}

function Dot() {
  return <span aria-hidden>·</span>;
}
