"use client";

import { ExternalLink } from "lucide-react";

import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface DiscogsPressingLinkProps {
  href: string;
  title: string;
  locale?: Locale;
}

export function DiscogsPressingLink({ href, title, locale }: DiscogsPressingLinkProps) {
  const contextLocale = useLocale();
  const lang = locale ?? contextLocale;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t(lang, "explorer.onDiscogsAria", { title })}
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      <ExternalLink className="size-4 shrink-0" aria-hidden />
      {t(lang, "explorer.onDiscogs")}
    </a>
  );
}
