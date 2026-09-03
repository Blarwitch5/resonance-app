"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLayoutEffect } from "react";

import { formatListenFromLocation } from "@/lib/collection/href";
import type { MediaFormat } from "@/lib/collection/types";

interface FormatTintProps {
  formats: MediaFormat[];
}

export function FormatTint({ formats }: FormatTintProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const format = formatListenFromLocation(pathname, searchParams.get("format") ?? undefined, formats);

  useLayoutEffect(() => {
    const root = document.documentElement;

    if (format) {
      root.dataset.format = format;
    } else {
      delete root.dataset.format;
    }

    return () => {
      delete root.dataset.format;
    };
  }, [format]);

  return null;
}
