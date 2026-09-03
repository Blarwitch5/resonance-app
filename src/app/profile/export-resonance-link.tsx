"use client";

import { Download } from "lucide-react";

import { useT } from "@/components/locale-provider";

export function ExportResonanceLink() {
  const t = useT();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("backup.exportHint")}
      </p>
      <a
        href="/api/resonance/backup"
        className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-full border border-border bg-transparent px-6 text-sm font-semibold text-text outline-none hover:bg-surface-pressed focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <Download className="size-4 shrink-0" aria-hidden />
        {t("backup.export")}
      </a>
    </div>
  );
}
