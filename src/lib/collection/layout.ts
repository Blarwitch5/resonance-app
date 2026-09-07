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
export const shelfListHitClass =
  "rounded-rs-md px-3 hover:bg-surface-pressed group-data-[menu=open]:bg-surface-pressed group-data-[record-swipe=open]:bg-surface-pressed group-data-[record-swipe=dragging]:bg-surface-pressed";

/** Cover stays beside the journal once the page is two columns. One column: it scrolls away. */
export const journalCoverStickyClass = "lg:sticky lg:top-6";

export const confirmCoverStickyClass = "sm:sticky sm:top-6";

/** Confirm submit: fixed above the thumb bar until the form slot docks it. */
export const confirmSubmitFixedClass =
  "fixed inset-x-4 z-50 border-t border-border bg-background/95 px-1 pt-3 pb-2 backdrop-blur-md bottom-[calc(var(--rs-bottom-chrome)+max(0.5rem,env(safe-area-inset-bottom)))] sm:inset-x-6 lg:inset-x-auto lg:right-8 lg:left-[calc(15rem+1.5rem+2rem)] lg:bottom-4 lg:max-w-xl";

export const confirmSubmitDockClass =
  "relative z-20 -mx-1 border-t border-border bg-background/95 px-1 pt-3 pb-2 backdrop-blur-md";

export const confirmSubmitSlotClass = "h-[4.25rem] shrink-0";

/** Soft primary halo on the confirm CTA — tokenized, not an ad-hoc shadow. */
export const confirmSubmitGlowClass = "shadow-glow-primary motion-reduce:shadow-none";
