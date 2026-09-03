import type { ViewMode } from "@/lib/settings/types";

export function shelfResultsClass(layout: ViewMode): string {
  if (layout === "list") {
    return "flex flex-col gap-1 p-1";
  }

  return "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4";
}

/** List-row hover: inset from neighbors, with room beside the cover and the heart. */
export const shelfListHitClass = "rounded-rs-md px-3 hover:bg-surface-pressed";

/** Cover stays beside the journal once the page is two columns. One column: it scrolls away. */
export const journalCoverStickyClass = "lg:sticky lg:top-6";

export const confirmCoverStickyClass = "sm:sticky sm:top-6";
