import { Layers } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { formatIcons } from "@/components/ui/format-tokens";
import { toggleMediaFormat } from "@/lib/collection/href";
import { MEDIA_FORMATS, type MediaFormat } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface FormatChipsProps {
  active?: MediaFormat;
  enabled?: MediaFormat[];
  buildHref: (format?: MediaFormat) => string;
  className?: string;
  locale?: Locale;
}

const formatClass: Record<MediaFormat, string> = {
  vinyl: "aria-[current=page]:bg-primary-soft aria-[current=page]:text-on-primary-soft",
  cassette: "aria-[current=page]:bg-secondary-soft aria-[current=page]:text-on-secondary-soft",
  cd: "aria-[current=page]:bg-info-soft aria-[current=page]:text-info",
};

export function FormatChips({
  active,
  enabled = MEDIA_FORMATS.slice(),
  buildHref,
  className = "",
  locale = "en",
}: FormatChipsProps) {
  const formats = MEDIA_FORMATS.filter((format) => enabled.includes(format));

  if (formats.length < 2) {
    return null;
  }

  return (
    <nav aria-label={t(locale, "format.legend")} className={`flex flex-wrap gap-2 ${className}`.trim()}>
      <ChipLink
        href={buildHref()}
        isActive={!active}
        className="group max-lg:gap-0 max-lg:px-2.5"
        aria-label={t(locale, "format.all")}
      >
        <Layers className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
        <span className="sr-only lg:not-sr-only">{t(locale, "format.all")}</span>
      </ChipLink>
      {formats.map((format) => {
        const Icon = formatIcons[format];
        const isActive = active === format;
        const label = t(locale, `format.${format}`);

        return (
          <ChipLink
            key={format}
            href={buildHref(toggleMediaFormat(active, format))}
            isActive={isActive}
            className={`group capitalize max-lg:gap-0 max-lg:px-2.5 ${formatClass[format]}`}
            aria-label={
              isActive ? t(locale, "format.clearAria", { format: label }) : label
            }
          >
            <Icon className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
            <span className="sr-only lg:not-sr-only">{label}</span>
          </ChipLink>
        );
      })}
    </nav>
  );
}
