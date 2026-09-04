"use client";

import { Download } from "lucide-react";

import { useT } from "@/components/locale-provider";
import { ButtonLink } from "@/components/ui/button";

export function ExportResonanceLink() {
  const t = useT();

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("backup.exportHint")}
      </p>
      <ButtonLink href="/api/resonance/backup" variant="ghost" className="self-start">
        <Download className="size-4 shrink-0" aria-hidden />
        {t("backup.export")}
      </ButtonLink>
    </div>
  );
}
