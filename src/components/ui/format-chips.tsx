import { Layers } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { formatIcons } from "@/components/ui/format-icon";
import { MEDIA_FORMATS, parseMediaFormat, type MediaFormat } from "@/lib/collection/types";

interface FormatChipsProps {
  active?: MediaFormat;
  enabled?: MediaFormat[];
  buildHref: (format?: MediaFormat) => string;
  className?: string;
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
}: FormatChipsProps) {
  const formats = MEDIA_FORMATS.filter((format) => enabled.includes(format));

  if (formats.length < 2) {
    return null;
  }

  return (
    <nav aria-label="Format" className={`flex flex-wrap gap-2 ${className}`.trim()}>
      <ChipLink href={buildHref()} isActive={!active} className="group">
        <Layers className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
        All
      </ChipLink>
      {formats.map((format) => {
        const Icon = formatIcons[format];

        return (
          <ChipLink
            key={format}
            href={buildHref(format)}
            isActive={active === format}
            className={`group capitalize ${formatClass[format]}`}
          >
            <Icon className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
            {format}
          </ChipLink>
        );
      })}
    </nav>
  );
}

export function selectedFormat(value: string | undefined): MediaFormat | undefined {
  return parseMediaFormat(value);
}
