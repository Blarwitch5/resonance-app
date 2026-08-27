import { LayoutGrid, Monitor, type LucideIcon } from "lucide-react";

import { saveViewModeAction } from "@/app/collection/actions";
import { ChipButton } from "@/components/ui/chip";
import type { CollectionQuery } from "@/lib/collection/types";
import { VIEW_MODES, type ViewMode } from "@/lib/settings/types";

interface ViewChipsProps {
  active: ViewMode;
  listen: CollectionQuery;
  page?: number;
}

const labels: Record<ViewMode, string> = {
  list: "Auto",
  grid: "Grid",
};

const icons: Record<ViewMode, LucideIcon> = {
  list: Monitor,
  grid: LayoutGrid,
};

export function ViewChips({ active, listen, page = 1 }: ViewChipsProps) {
  return (
    <nav aria-label="Layout" className="flex flex-wrap gap-2">
      {VIEW_MODES.map((view) => {
        const Icon = icons[view];

        return (
          <form key={view} action={saveViewModeAction} className="contents">
            <input type="hidden" name="view" value={view} />
            {listen.format ? <input type="hidden" name="format" value={listen.format} /> : null}
            {listen.query ? <input type="hidden" name="q" value={listen.query} /> : null}
            {listen.sort && listen.sort !== "recent" ? (
              <input type="hidden" name="sort" value={listen.sort} />
            ) : null}
            {listen.keptClose ? <input type="hidden" name="kept" value="1" /> : null}
            {listen.artist ? <input type="hidden" name="artist" value={listen.artist} /> : null}
            {listen.genre ? <input type="hidden" name="genre" value={listen.genre} /> : null}
            {listen.label ? <input type="hidden" name="label" value={listen.label} /> : null}
            {listen.found ? <input type="hidden" name="found" value={listen.found} /> : null}
            {listen.when !== undefined ? (
              <input type="hidden" name="when" value={String(listen.when)} />
            ) : null}
            {listen.arrived !== undefined ? (
              <input type="hidden" name="arrived" value={String(listen.arrived)} />
            ) : null}
            {listen.condition ? (
              <input type="hidden" name="condition" value={listen.condition} />
            ) : null}
            {listen.decade !== undefined ? (
              <input type="hidden" name="decade" value={String(listen.decade)} />
            ) : null}
            {listen.year !== undefined ? (
              <input type="hidden" name="year" value={String(listen.year)} />
            ) : null}
            {page > 1 ? <input type="hidden" name="page" value={page} /> : null}
            <ChipButton isActive={active === view}>
              <Icon className="size-4 shrink-0" aria-hidden />
              {labels[view]}
            </ChipButton>
          </form>
        );
      })}
    </nav>
  );
}
