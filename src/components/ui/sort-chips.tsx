import { Calendar, Clock, Sunrise, UserRound, type LucideIcon } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { collectionHref } from "@/lib/collection/href";
import { COLLECTION_SORTS, type CollectionQuery, type CollectionSort } from "@/lib/collection/types";

interface SortChipsProps {
  active: CollectionSort;
  listen: CollectionQuery;
}

const labels: Record<CollectionSort, string> = {
  recent: "Recently added",
  artist: "Artist",
  year: "Year",
  found: "When it found you",
};

const icons: Record<CollectionSort, LucideIcon> = {
  recent: Clock,
  artist: UserRound,
  year: Calendar,
  found: Sunrise,
};

export function SortChips({ active, listen }: SortChipsProps) {
  return (
    <nav aria-label="Sort" className="flex flex-wrap gap-2">
      {COLLECTION_SORTS.map((sort) => {
        const Icon = icons[sort];

        return (
          <ChipLink key={sort} href={collectionHref({ ...listen, sort })} isActive={active === sort}>
            <Icon className="size-4 shrink-0" aria-hidden />
            {labels[sort]}
          </ChipLink>
        );
      })}
    </nav>
  );
}
