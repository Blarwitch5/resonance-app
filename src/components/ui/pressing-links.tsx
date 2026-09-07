"use client";

import { ScanSearch } from "lucide-react";
import Link from "next/link";

import { DiscogsPressingLink } from "@/components/ui/discogs-pressing-link";
import { SharePressingButton } from "@/components/ui/share-pressing-button";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface PressingLinksProps {
  title: string;
  artist: string;
  href?: string | null;
  releaseId?: number;
  itemId?: string | null;
  elsewhereHref: string;
  locale?: Locale;
  showShare?: boolean;
}

export function PressingLinks({
  href,
  releaseId,
  itemId = null,
  title,
  artist,
  elsewhereHref,
  locale,
  showShare = true,
}: PressingLinksProps) {
  const contextLocale = useLocale();
  const lang = locale ?? contextLocale;

  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-start sm:gap-x-6">
      {showShare ? <SharePressingButton itemId={itemId} title={title} artist={artist} /> : null}
      {href ? <DiscogsPressingLink href={href} title={title} releaseId={releaseId} locale={lang} /> : null}
      <Link
        href={elsewhereHref}
        aria-label={t(lang, "thread.hearElsewhereBy", { title, artist })}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <ScanSearch className="size-4 shrink-0" aria-hidden />
        {t(lang, "common.hearElsewhere")}
      </Link>
    </div>
  );
}
