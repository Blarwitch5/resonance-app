import {
  confirmCoverStickyClass,
  confirmSubmitSlotClass,
  journalCoverStickyClass,
  shelfResultsClass,
} from "@/lib/collection/layout";

function Bone({ className }: { className: string }) {
  return <div className={`animate-pulse bg-surface-pressed ${className}`} />;
}

function CoverTileBones({ count }: { count: number }) {
  return (
    <ul className={shelfResultsClass("grid")}>
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex flex-col gap-2">
          <Bone className="aspect-square rounded-rs-sm" />
          <Bone className="h-3 w-3/4 rounded-rs-sm" />
          <Bone className="h-3 w-1/2 rounded-rs-sm" />
        </li>
      ))}
    </ul>
  );
}

function ChipRowBones({ widths }: { widths: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {widths.map((width, index) => (
        <Bone key={`${width}-${index}`} className={`h-9 ${width} rounded-full`} />
      ))}
    </div>
  );
}

function FieldBone({ tall }: { tall?: boolean }) {
  return (
    <div className="flex flex-col gap-2">
      <Bone className="h-3 w-20 rounded-rs-sm" />
      <Bone className={`w-full rounded-rs-md ${tall ? "h-24" : "h-11"}`} />
    </div>
  );
}

function TrackRowBones({ count }: { count: number }) {
  return (
    <ul className="flex flex-col gap-2">
      {Array.from({ length: count }, (_, index) => (
        <li key={index} className="flex items-center gap-3">
          <Bone className="size-9 shrink-0 rounded-full" />
          <div className="flex min-w-0 flex-1 flex-col gap-1.5">
            <Bone className="h-3 w-3/4 rounded-rs-sm" />
            <Bone className="h-2.5 w-1/3 rounded-rs-sm" />
          </div>
        </li>
      ))}
    </ul>
  );
}

/** Collection shelf — header, search, listen/filter/view, cover grid. */
export function ShelfLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Bone className="h-8 w-40 rounded-rs-sm" />
          <Bone className="h-4 w-64 max-w-full rounded-rs-sm" />
        </div>
        <div className="hidden shrink-0 gap-2 lg:flex">
          <Bone className="size-11 rounded-full" />
          <Bone className="h-11 w-28 rounded-full" />
        </div>
      </div>
      <div className="flex flex-col gap-3">
        <Bone className="h-11 w-full rounded-full" />
        <div className="flex flex-wrap items-center gap-2">
          <Bone className="h-11 w-24 rounded-full" />
          <Bone className="h-11 w-24 rounded-full" />
          <div className="ms-auto">
            <Bone className="size-11 rounded-full" />
          </div>
        </div>
      </div>
      <CoverTileBones count={8} />
    </div>
  );
}

/** Explorer search — same shelf rhythm, format chips instead of filter sheets. */
export function ExplorerLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <div className="flex flex-col gap-3">
        <Bone className="h-8 w-36 rounded-rs-sm" />
        <Bone className="h-4 w-72 max-w-full rounded-rs-sm" />
      </div>
      <div className="flex flex-col gap-3">
        <Bone className="h-11 w-full rounded-full" />
        <div className="flex flex-wrap items-center gap-2">
          <ChipRowBones widths={["w-16", "w-14", "w-20", "w-16"]} />
          <div className="ms-auto">
            <Bone className="size-11 rounded-full" />
          </div>
        </div>
        <Bone className="hidden h-10 w-full max-w-3xl rounded-rs-md lg:block" />
      </div>
      <CoverTileBones count={8} />
    </div>
  );
}

/** Journal album — back, neighbors, cover + threads, sides, memory. */
export function JournalLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-live="polite">
      <Bone className="h-4 w-28 rounded-rs-sm" />
      <div className="flex items-center justify-between gap-4">
        <Bone className="h-4 w-32 rounded-rs-sm" />
        <Bone className="h-4 w-32 rounded-rs-sm" />
      </div>
      <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,20rem)_1fr]">
        <div className={journalCoverStickyClass}>
          <Bone className="aspect-square rounded-rs-sm" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-3">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 flex-col gap-2">
                <Bone className="h-8 w-2/3 max-w-md rounded-rs-sm" />
                <Bone className="h-4 w-40 rounded-rs-sm" />
              </div>
              <Bone className="size-11 shrink-0 rounded-full" />
            </div>
            <Bone className="h-4 w-48 rounded-rs-sm" />
            <Bone className="h-9 w-28 rounded-full" />
            <div className="flex flex-wrap gap-2">
              <Bone className="h-4 w-24 rounded-rs-sm" />
              <Bone className="h-4 w-28 rounded-rs-sm" />
            </div>
          </div>
          <TrackRowBones count={5} />
          <div className="flex flex-col gap-3">
            <Bone className="h-4 w-36 rounded-rs-sm" />
            <div className="flex gap-2 overflow-hidden">
              {Array.from({ length: 4 }, (_, index) => (
                <Bone key={index} className="size-16 shrink-0 rounded-rs-sm" />
              ))}
            </div>
          </div>
          <div className="flex flex-col gap-4">
            <FieldBone />
            <FieldBone tall />
            <div className="flex gap-2">
              <Bone className="h-11 w-28 rounded-full" />
              <Bone className="h-11 w-24 rounded-full" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Confirm Discogs add — header, cover 16rem, sides, format/kind chips, CTA. */
export function ConfirmLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-live="polite">
      <Bone className="h-4 w-28 rounded-rs-sm" />
      <header className="flex flex-col gap-2">
        <Bone className="h-3 w-20 rounded-rs-sm" />
        <Bone className="h-8 w-2/3 max-w-md rounded-rs-sm" />
        <Bone className="h-4 w-40 rounded-rs-sm" />
      </header>
      <div className="grid items-start gap-8 sm:grid-cols-[minmax(0,16rem)_1fr]">
        <div className={confirmCoverStickyClass}>
          <Bone className="aspect-square rounded-rs-sm" />
        </div>
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Bone className="h-4 w-full rounded-rs-sm" />
            <Bone className="h-4 w-5/6 rounded-rs-sm" />
            <Bone className="h-4 w-2/3 rounded-rs-sm" />
          </div>
          <TrackRowBones count={4} />
          <div className="flex flex-col gap-4">
            <ChipRowBones widths={["w-20", "w-16", "w-24"]} />
            <ChipRowBones widths={["w-28", "w-32"]} />
            <FieldBone tall />
            <div className={confirmSubmitSlotClass}>
              <Bone className="h-12 w-48 rounded-full sm:h-14" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Manual write-in — back, header, stacked fields, chips, CTA. */
export function ManualLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-8" aria-busy aria-live="polite">
      <Bone className="h-4 w-28 rounded-rs-sm" />
      <header className="flex flex-col gap-2">
        <Bone className="h-3 w-20 rounded-rs-sm" />
        <Bone className="h-8 w-48 rounded-rs-sm" />
        <Bone className="h-4 w-72 max-w-full rounded-rs-sm" />
      </header>
      <div className="flex flex-col gap-5">
        <FieldBone />
        <FieldBone />
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldBone />
          <FieldBone />
        </div>
        <FieldBone />
        <div className="flex flex-col gap-2">
          <Bone className="h-3 w-24 rounded-rs-sm" />
          <Bone className="aspect-4/3 max-w-xs rounded-rs-md" />
        </div>
        <ChipRowBones widths={["w-20", "w-16", "w-24", "w-16"]} />
        <ChipRowBones widths={["w-28", "w-32"]} />
        <FieldBone tall />
        <div className={confirmSubmitSlotClass}>
          <Bone className="h-12 w-48 rounded-full sm:h-14" />
        </div>
      </div>
    </div>
  );
}

/** Profile — header + avatar, tab chips, stats cards (default resonance). */
export function ProfileLoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6" aria-busy aria-live="polite">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <Bone className="h-8 w-32 rounded-rs-sm" />
          <Bone className="h-4 w-56 max-w-full rounded-rs-sm" />
          <Bone className="h-4 w-72 max-w-full rounded-rs-sm" />
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Bone className="size-11 rounded-full" />
          <Bone className="size-12 rounded-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 lg:hidden">
        <Bone className="h-9 w-28 rounded-full" />
        <Bone className="h-9 w-24 rounded-full" />
        <Bone className="h-9 w-28 rounded-full" />
      </div>
      <section className="flex flex-col gap-6">
        <Bone className="h-5 w-40 rounded-rs-sm" />
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {Array.from({ length: 6 }, (_, index) => (
            <li
              key={index}
              className="flex flex-col gap-3 rounded-rs-md border border-border bg-surface p-4"
            >
              <div className="flex items-center gap-2">
                <Bone className="size-5 rounded-rs-sm" />
                <Bone className="h-3 w-24 rounded-rs-sm" />
              </div>
              <Bone className="h-6 w-32 rounded-rs-sm" />
              <Bone className="h-3 w-full rounded-rs-sm" />
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

/** Generic centered placeholder — prefer a page-shaped skeleton when possible. */
export function PaneLoadingSkeleton({ label }: { label?: string }) {
  return (
    <div
      className="flex flex-1 flex-col items-center justify-center gap-4 py-16"
      aria-busy
      aria-live="polite"
    >
      <Bone className="size-12 rounded-full" />
      {label ? <p className="text-sm text-text-secondary">{label}</p> : null}
      <Bone className="h-3 w-40 rounded-rs-sm" />
    </div>
  );
}
