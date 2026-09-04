"use client";

import { CircleDot, MapPin, Music } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { ChipLink } from "@/components/ui/chip";
import { CopyPressingButton } from "@/components/ui/copy-pressing-button";
import { FormatIcon } from "@/components/ui/format-icon";
import { PressingLinks } from "@/components/ui/pressing-links";
import {
  artistClass,
  creditClass,
  displayTitleClass,
  factValueClass,
  kickerClass,
  yearValueClass,
} from "@/components/ui/type";
import { useLocale, useT } from "@/components/locale-provider";
import { pressingFacts, type PressingThreadView } from "@/lib/collection/pressing-threads";
import type { Locale } from "@/lib/settings/types";

interface PressingArtistProps {
  name: string;
  href: string | null;
}

export function PressingArtist({ name, href }: PressingArtistProps) {
  const t = useT();

  if (!href) {
    return <p className={artistClass}>{name}</p>;
  }

  return (
    <Link
      href={href}
      aria-label={t("thread.hearOnShelf", { name })}
      className={`inline-flex min-h-11 items-center outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong ${artistClass}`}
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
  const factsLocale = useLocale();
  const facts = pressingFacts(threads, locale ?? factsLocale);
  const hasChips = threads.genres.length > 0 || threads.condition !== null;
  const hasIdentity = Boolean(title || showArtist);
  const hasCopies = Boolean(threads.catalogNumber || threads.barcode);

  return (
    <div className="flex flex-col gap-5">
      <div className={hasIdentity ? "flex flex-wrap items-start gap-4" : undefined}>
        <FormatIcon format={threads.format} href={threads.formatHref} />
        {hasIdentity ? (
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            {title ? <h1 className={titleClassName}>{title}</h1> : null}
            {showArtist ? <PressingArtist name={threads.artist} href={threads.artistHref} /> : null}
          </div>
        ) : null}
      </div>
      {facts.length > 0 ? (
        <dl className="grid grid-cols-2 gap-x-6 gap-y-3 sm:grid-cols-3">
          {facts.map((fact) => (
            <div key={fact.key} className="flex min-h-11 min-w-0 flex-col justify-center gap-1">
              <dt className={kickerClass}>{fact.label}</dt>
                  <dd className={fact.isMono ? yearValueClass : factValueClass}>
                    {fact.href ? (
                      <ThreadLink href={fact.href} ariaLabel={fact.ariaLabel ?? fact.value}>
                        {fact.value}
                      </ThreadLink>
                    ) : (
                      <span className="inline-flex min-h-11 items-center">{fact.value}</span>
                    )}
                  </dd>
            </div>
          ))}
        </dl>
      ) : null}
      {threads.creditLine ? (
        <p className="flex flex-col gap-1">
          <span className={kickerClass}>{t("thread.credits")}</span>
          <span className={creditClass}>{threads.creditLine}</span>
        </p>
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
      {hasCopies ? (
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {threads.catalogNumber ? <CopyPressingButton kind="catalog" value={threads.catalogNumber} /> : null}
          {threads.barcode ? <CopyPressingButton kind="barcode" value={threads.barcode} /> : null}
        </div>
      ) : null}
      {threads.found ? (
        <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
          <span className={kickerClass}>{t("thread.found")}</span>
          <MapPin className="size-3.5 shrink-0 text-text-tertiary" aria-hidden />
          {threads.found.href ? (
            <ThreadLink
              href={threads.found.href}
              ariaLabel={t("thread.hearFound", { place: threads.found.where })}
              compact
            >
              <span className={factValueClass}>{threads.found.where}</span>
            </ThreadLink>
          ) : (
            <span className={factValueClass}>{threads.found.where}</span>
          )}
          {threads.found.when ? (
            threads.found.whenHref ? (
              <ThreadLink
                href={threads.found.whenHref}
                ariaLabel={t("thread.hearFound", { place: threads.found.when.slice(0, 4) })}
                compact
              >
                <span className={yearValueClass}>{threads.found.when}</span>
              </ThreadLink>
            ) : (
              <span className={yearValueClass}>{threads.found.when}</span>
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
