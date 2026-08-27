"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { isReturnPath, returnStorageKey } from "@/components/return-path";

export function RememberReturn() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!isReturnPath(pathname)) {
      return;
    }

    const search = searchParams.toString();
    const href = search.length > 0 ? `${pathname}?${search}` : pathname;

    try {
      sessionStorage.setItem(returnStorageKey(pathname), href);
    } catch {
      // Private mode can refuse storage — Back still has a fallback href.
    }
  }, [pathname, searchParams]);

  return null;
}
