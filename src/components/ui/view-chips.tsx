"use client";

import { LayoutGrid, List, type LucideIcon } from "lucide-react";

import { saveViewModeAction } from "@/app/collection/actions";
import { ChipButton } from "@/components/ui/chip";
import { useT } from "@/components/locale-provider";
import { VIEW_MODES, type ViewMode } from "@/lib/settings/types";

interface ViewChipsProps {
  active: ViewMode;
  next: string;
}

const labels: Record<ViewMode, string> = {
  list: "layout.list",
  grid: "layout.grid",
};

const icons: Record<ViewMode, LucideIcon> = {
  list: List,
  grid: LayoutGrid,
};

export function ViewChips({ active, next }: ViewChipsProps) {
  const t = useT();

  return (
    <nav aria-label={t("layout.nav")} className="flex flex-wrap gap-2">
      {VIEW_MODES.map((view) => {
        const Icon = icons[view];

        return (
          <form key={view} action={saveViewModeAction} className="contents">
            <input type="hidden" name="view" value={view} />
            <input type="hidden" name="next" value={next} />
            <ChipButton
              isActive={active === view}
              aria-label={t(labels[view])}
              className="min-w-11 justify-center"
            >
              <Icon className="size-4 shrink-0" aria-hidden />
              <span className="hidden lg:inline">{t(labels[view])}</span>
            </ChipButton>
          </form>
        );
      })}
    </nav>
  );
}
