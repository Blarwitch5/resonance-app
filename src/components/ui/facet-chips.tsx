import { Calendar, CalendarPlus, CircleDot, Hourglass, MapPin, Music, Tag, UserRound } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { collectionHref } from "@/lib/collection/href";
import { decadeLabel } from "@/lib/collection/stats";
import { CONDITION_LABELS, type CollectionQuery } from "@/lib/collection/types";

interface FacetChipsProps {
  listen: CollectionQuery;
}

export function FacetChips({ listen }: FacetChipsProps) {
  return (
    <>
      {listen.artist ? (
        <ChipLink href={collectionHref({ ...listen, artist: undefined })} isActive>
          <UserRound className="size-4 shrink-0" aria-hidden />
          {listen.artist}
        </ChipLink>
      ) : null}
      {listen.label ? (
        <ChipLink href={collectionHref({ ...listen, label: undefined })} isActive>
          <Tag className="size-4 shrink-0" aria-hidden />
          {listen.label}
        </ChipLink>
      ) : null}
      {listen.found ? (
        <ChipLink href={collectionHref({ ...listen, found: undefined })} isActive>
          <MapPin className="size-4 shrink-0" aria-hidden />
          {listen.found}
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
          Arrived {listen.arrived}
        </ChipLink>
      ) : null}
      {listen.condition ? (
        <ChipLink href={collectionHref({ ...listen, condition: undefined })} isActive>
          <CircleDot className="size-4 shrink-0" aria-hidden />
          {CONDITION_LABELS[listen.condition]}
        </ChipLink>
      ) : null}
      {listen.genre ? (
        <ChipLink href={collectionHref({ ...listen, genre: undefined })} isActive>
          <Music className="size-4 shrink-0" aria-hidden />
          {listen.genre}
        </ChipLink>
      ) : null}
      {listen.decade !== undefined ? (
        <ChipLink href={collectionHref({ ...listen, decade: undefined })} isActive>
          <Hourglass className="size-4 shrink-0" aria-hidden />
          {decadeLabel(listen.decade)}
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
