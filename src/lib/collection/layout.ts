import type { ViewMode } from "@/lib/settings/types";

export function shelfResultsClass(layout: ViewMode): string {
  if (layout === "list") {
    return "flex flex-col gap-1 p-1";
  }

  return "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4";
}

export const SHELF_ARRIVE_STEP_MS = 55;
export const SHELF_ARRIVE_MAX_INDEX = 11;

export function shelfArriveDelayMs(index: number): number {
  return Math.min(Math.max(index, 0), SHELF_ARRIVE_MAX_INDEX) * SHELF_ARRIVE_STEP_MS;
}

export function shelfArriveProps(index: number): { className: string; style: { animationDelay: string } } {
  return {
    className: "motion-safe:shelf-arrive",
    style: { animationDelay: `${shelfArriveDelayMs(index)}ms` },
  };
}

/** List-row hover: inset from neighbors, with room beside the cover and the heart. */
export const shelfListHitClass = "rounded-rs-md px-3 hover:bg-surface-pressed";

/** Cover stays beside the journal once the page is two columns. One column: it scrolls away. */
export const journalCoverStickyClass = "lg:sticky lg:top-6";

export const confirmCoverStickyClass = "sm:sticky sm:top-6";
