"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";

import { useT } from "@/components/locale-provider";
import { journalFromHref } from "@/lib/collection/href";
import type { ShelfNeighbor } from "@/lib/collection/types";

interface ShelfNeighborsProps {
  before: ShelfNeighbor | null;
  after: ShelfNeighbor | null;
  from?: string;
}

export function ShelfNeighbors({ before, after, from }: ShelfNeighborsProps) {
  const t = useT();

  if (!before && !after) {
    return null;
  }

  return (
    <nav aria-label={t("journal.throughShelf")} className="flex items-center justify-between gap-4">
      {before ? (
        <NeighborLink direction="before" neighbor={before} from={from} />
      ) : (
        <span />
      )}
      {after ? (
        <NeighborLink direction="after" neighbor={after} from={from} />
      ) : (
        <span />
      )}
    </nav>
  );
}

function NeighborLink({
  direction,
  neighbor,
  from,
}: {
  direction: "before" | "after";
  neighbor: ShelfNeighbor;
  from?: string;
}) {
  const t = useT();
  const isBefore = direction === "before";

  return (
    <Link
      href={journalFromHref(neighbor.id, from)}
      data-record-link=""
      data-shelf-neighbor={direction}
      aria-label={isBefore ? t("journal.neighborBefore", { title: neighbor.title }) : t("journal.neighborAfter", { title: neighbor.title })}
      className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
    >
      {isBefore ? <ChevronLeft className="size-4 shrink-0" aria-hidden /> : null}
      {isBefore ? t("journal.oneBefore") : t("journal.oneAfter")}
      {isBefore ? null : <ChevronRight className="size-4 shrink-0" aria-hidden />}
    </Link>
  );
}
