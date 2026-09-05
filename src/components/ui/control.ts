/** Shared control rhythm: 44px mobile, 48px from sm, rs-sm radius, 16px type (iOS zoom). */

export const controlClass =
  "min-h-11 w-full rounded-rs-sm border border-border bg-surface py-2 text-base font-normal text-text outline-none ring-border-strong focus:ring-2 sm:min-h-12 sm:py-3";

export function controlInsetClass(options: { leading?: boolean | "search"; trailing?: boolean } = {}): string {
  const start =
    options.leading === "search" ? "pl-11 sm:pl-12" : options.leading ? "pl-10 sm:pl-11" : "pl-3 sm:pl-4";
  const end = options.trailing ? "pr-12" : "pr-3 sm:pr-4";
  return `${start} ${end}`;
}

export const controlFrameClass =
  "relative flex min-h-11 items-center gap-1 rounded-rs-sm border border-border bg-surface outline-none focus-within:ring-2 focus-within:ring-border-strong sm:min-h-12";

export const controlIconSlotClass =
  "flex w-11 shrink-0 items-center justify-center text-text-tertiary sm:w-12";

export const controlBareClass =
  "min-h-11 w-0 min-w-0 flex-1 bg-transparent py-2 text-base font-normal text-text outline-none sm:min-h-12";

export const textAreaClass =
  "w-full rounded-rs-sm border border-border bg-surface px-3 py-2 text-base font-normal text-text outline-none ring-border-strong focus:ring-2 sm:px-4 sm:py-3";

export const labelClass = "flex flex-col gap-2 text-sm font-medium text-text";

export const fieldsetClass = "flex flex-col gap-2";

export const legendClass = "text-sm font-medium text-text";
