"use client";

import { Calendar, Clock, Sunrise, UserRound, type LucideIcon } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { useT } from "@/components/locale-provider";
import { collectionHref } from "@/lib/collection/href";
import { COLLECTION_SORTS, type CollectionQuery, type CollectionSort } from "@/lib/collection/types";

interface SortChipsProps {
  active: CollectionSort;
  listen: CollectionQuery;
}

const labels: Record<CollectionSort, string> = {
  recent: "sort.recent",
  artist: "sort.artist",
  year: "sort.year",
  found: "sort.found",
};

const icons: Record<CollectionSort, LucideIcon> = {
  recent: Clock,
  artist: UserRound,
  year: Calendar,
  found: Sunrise,
};

export function SortChips({ active, listen }: SortChipsProps) {
  const t = useT();

  return (
    <nav aria-label={t("sort.nav")} className="flex flex-wrap gap-2">
      {COLLECTION_SORTS.map((sort) => {
        const Icon = icons[sort];

        return (
          <ChipLink key={sort} href={collectionHref({ ...listen, sort })} isActive={active === sort}>
            <Icon className="size-4 shrink-0" aria-hidden />
            {t(labels[sort])}
          </ChipLink>
        );
      })}
    </nav>
  );
}
