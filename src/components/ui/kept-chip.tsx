import { Heart } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { collectionHref } from "@/lib/collection/href";
import type { CollectionQuery } from "@/lib/collection/types";

interface KeptChipProps {
  listen: CollectionQuery;
}

export function KeptChip({ listen }: KeptChipProps) {
  const isActive = Boolean(listen.keptClose);

  return (
    <ChipLink href={collectionHref({ ...listen, keptClose: !isActive })} isActive={isActive}>
      <Heart className={`size-4 shrink-0 ${isActive ? "fill-current" : ""}`} aria-hidden />
      Kept close
    </ChipLink>
  );
}
