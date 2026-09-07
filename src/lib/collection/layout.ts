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
  "fixed z-50 w-fit max-w-[calc(100vw-2rem)] left-1/2 -translate-x-1/2 bottom-[calc(var(--rs-bottom-chrome)+max(0.5rem,env(safe-area-inset-bottom)))] lg:bottom-4";

export const confirmSubmitDockClass = "relative z-20 mx-auto flex w-full justify-center";

export const confirmSubmitSlotClass = "flex min-h-12 w-full shrink-0 justify-center sm:min-h-14";

/** Soft primary halo on the confirm CTA — tokenized, not an ad-hoc shadow. */
export const confirmSubmitGlowClass = "shadow-glow-primary motion-reduce:shadow-none";

/** True when the natural slot overlaps the visible scrollport (or has reached the end). */
export function shouldDockConfirmSubmit(input: {
  slotTop: number;
  slotBottom: number;
  viewportTop: number;
  viewportBottom: number;
  isScrollNearEnd?: boolean;
}): boolean {
  if (input.isScrollNearEnd) {
    return true;
  }

  return input.slotTop < input.viewportBottom && input.slotBottom > input.viewportTop;
}

/** Near the end of a scrollport — room for sub-pixel / rubber-band noise. */
export function isScrollNearEnd(input: {
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
  slackPx?: number;
}): boolean {
  const slack = input.slackPx ?? 48;
  return input.scrollHeight - input.scrollTop - input.clientHeight <= slack;
}
