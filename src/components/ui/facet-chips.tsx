import { Calendar, CalendarPlus, CircleDot, Hourglass, MapPin, Music, Tag, UserRound } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { PressingText } from "@/components/ui/pressing-text";
import { collectionHref } from "@/lib/collection/href";
import type { CollectionQuery } from "@/lib/collection/types";
import { decadeName } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface FacetChipsProps {
  listen: CollectionQuery;
  locale?: Locale;
}

export function FacetChips({ listen, locale = "en" }: FacetChipsProps) {
  return (
    <>
      {listen.artist ? (
        <ChipLink href={collectionHref({ ...listen, artist: undefined })} isActive>
          <UserRound className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.artist}</PressingText>
        </ChipLink>
      ) : null}
      {listen.label ? (
        <ChipLink href={collectionHref({ ...listen, label: undefined })} isActive>
          <Tag className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.label}</PressingText>
        </ChipLink>
      ) : null}
      {listen.found ? (
        <ChipLink href={collectionHref({ ...listen, found: undefined })} isActive>
          <MapPin className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.found}</PressingText>
        </ChipLink>
      ) : null}
      {listen.when !== undefined ? (
        <ChipLink href={collectionHref({ ...listen, when: undefined })} isActive>
          <Calendar className="size-4 shrink-0" aria-hidden />
          {listen.when}
        </ChipLink>
      ) : null}
      {listen.arrived !== undefined ? (
        <ChipLink href={collectionHref({ ...listen, arrived: undefined })} isActive>
          <CalendarPlus className="size-4 shrink-0" aria-hidden />
          {t(locale, "collection.arrivedChip", { year: listen.arrived })}
        </ChipLink>
      ) : null}
      {listen.condition ? (
        <ChipLink href={collectionHref({ ...listen, condition: undefined })} isActive>
          <CircleDot className="size-4 shrink-0" aria-hidden />
          {t(locale, `condition.${listen.condition}`)}
        </ChipLink>
      ) : null}
      {listen.genre ? (
        <ChipLink href={collectionHref({ ...listen, genre: undefined })} isActive>
          <Music className="size-4 shrink-0" aria-hidden />
          <PressingText>{listen.genre}</PressingText>
        </ChipLink>
      ) : null}
      {listen.decade !== undefined ? (
        <ChipLink href={collectionHref({ ...listen, decade: undefined })} isActive>
          <Hourglass className="size-4 shrink-0" aria-hidden />
          {decadeName(locale, listen.decade)}
        </ChipLink>
      ) : null}
      {listen.year !== undefined ? (
        <ChipLink href={collectionHref({ ...listen, year: undefined })} isActive>
          <Calendar className="size-4 shrink-0" aria-hidden />
          {listen.year}
        </ChipLink>
      ) : null}
    </>
  );
}
