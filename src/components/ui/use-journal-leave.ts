"use client";

import { useEffect } from "react";

import { isSafeJournalHref } from "@/lib/collection/href";

export function useJournalLeave(href: string | null): boolean {
  useEffect(() => {
    if (!href || !isSafeJournalHref(href)) {
      return;
    }

    window.location.assign(href);
  }, [href]);

  return Boolean(href);
}
