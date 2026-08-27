import { Download } from "lucide-react";

export function ExportResonanceLink() {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        A file of this shelf and the memories beside it. Keep it somewhere quiet.
      </p>
      <a
        href="/api/resonance/backup"
        className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-text outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <Download className="size-4 shrink-0" aria-hidden />
        Take this resonance with you
      </a>
    </div>
  );
}
