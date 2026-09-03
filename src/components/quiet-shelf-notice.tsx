"use client";

import { usePathname } from "next/navigation";
import { useSyncExternalStore } from "react";

import { useT } from "@/components/locale-provider";
import { isQuietShelfVisible } from "@/lib/offline/shelf-cache";

function subscribeOnline(onStoreChange: () => void): () => void {
  window.addEventListener("online", onStoreChange);
  window.addEventListener("offline", onStoreChange);

  return () => {
    window.removeEventListener("online", onStoreChange);
    window.removeEventListener("offline", onStoreChange);
  };
}

export function QuietShelfNotice() {
  const t = useT();
  const pathname = usePathname();
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    () => navigator.onLine,
    () => true,
  );

  if (!isQuietShelfVisible(pathname, isOnline)) {
    return null;
  }

  return (
    <p
      role="status"
      className="rounded-rs-md border border-border bg-surface-elevated px-4 py-3 text-sm leading-6 text-text-secondary"
    >
      {t("offlinePage.quietShelf")}
    </p>
  );
}
