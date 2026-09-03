import type { ViewMode } from "@/lib/settings/types";

export function shelfResultsClass(layout: ViewMode): string {
  if (layout === "list") {
    return "-mx-4 flex flex-col sm:-mx-6 lg:-mx-8";
  }

  return "grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-4";
}

/** List-row hover: same inline inset as the page, bleed so covers stay aligned. */
export const shelfListHitClass =
  "rounded-rs-md px-4 hover:bg-surface-pressed sm:px-6 lg:px-8";
