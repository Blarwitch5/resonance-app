"use client";

import { ExternalLink } from "lucide-react";

import { hintClass, kickerClass } from "@/components/ui/type";
import { useLocale } from "@/components/locale-provider";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface DiscogsPressingLinkProps {
  href: string;
  title: string;
  releaseId?: number;
  locale?: Locale;
}

export function DiscogsPressingLink({ href, title, releaseId, locale }: DiscogsPressingLinkProps) {
  const contextLocale = useLocale();
  const lang = locale ?? contextLocale;

  return (
    <span className="flex flex-col gap-1">
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t(lang, "explorer.onDiscogsAria", { title })}
        className="flex min-h-11 flex-col justify-center gap-0.5 outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <span className="flex items-center gap-2">
          <ExternalLink className="size-4 shrink-0 text-text-tertiary" aria-hidden />
          <span className={kickerClass}>{t(lang, "copy.discogsKind")}</span>
        </span>
        <span className="pl-6 text-sm font-medium leading-5 text-text-secondary">
          {releaseId ? (
            <span className="font-mono text-xs font-normal">{releaseId}</span>
          ) : (
            t(lang, "explorer.onDiscogs")
          )}
        </span>
      </a>
      {releaseId ? <p className={`hidden pl-6 lg:block ${hintClass}`}>{t(lang, "copy.discogsHint")}</p> : null}
    </span>
  );
}
