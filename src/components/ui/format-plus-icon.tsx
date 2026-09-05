import { Music, Plus } from "lucide-react";

import { formatIcons } from "@/components/ui/format-tokens";
import type { MediaFormat } from "@/lib/collection/types";

interface FormatPlusIconProps {
  format?: MediaFormat | null;
}

export function FormatPlusIcon({ format = null }: FormatPlusIconProps) {
  const Icon = format ? formatIcons[format] : Music;

  return (
    <span className="relative inline-flex size-6 items-center justify-center" aria-hidden>
      <Icon className="size-5" />
      <span className="absolute -top-0.5 -right-0.5 flex size-3.5 items-center justify-center rounded-full bg-primary group-hover:bg-primary-hover group-active:bg-primary-active">
        <Plus className="size-2.5 text-on-primary" strokeWidth={3} />
      </span>
    </span>
  );
}
