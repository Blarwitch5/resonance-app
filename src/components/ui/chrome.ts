/** Floating glass chrome. Inset from the screen edge — never flush. */

export const glassPanelClass =
  "border border-glass-border bg-glass backdrop-blur-xl backdrop-saturate-[var(--rs-glass-saturate)]";

/** Desktop rail: same island inset as the thumb bar, a light wash so it reads on the page. */
export const sidebarShellClass =
  "hidden w-60 shrink-0 border border-glass-border bg-sidebar lg:m-3 lg:flex lg:min-h-0 lg:flex-col lg:rounded-rs-lg";

/** Mini player: island above the thumb bar; same 0.75rem inset as the desk rail. */
export const sampleDockClass =
  "fixed inset-x-3 bottom-[calc(var(--rs-bottom-chrome)+max(0.75rem,env(safe-area-inset-bottom)))] z-30 min-w-0 rounded-rs-lg border border-glass-border bg-glass px-3 py-2 backdrop-blur-xl backdrop-saturate-[var(--rs-glass-saturate)] lg:inset-x-auto lg:right-3 lg:bottom-3 lg:w-[min(22rem,calc(100vw-16.5rem-1.5rem))] lg:min-w-72 lg:bg-sidebar lg:backdrop-blur-none";
