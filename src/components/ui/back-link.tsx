"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

import { hrefPathname, resolvedBackHref, returnStorageKey } from "@/components/return-path";

interface BackLinkProps {
  href: string;
  children: string;
}

function subscribe(): () => void {
  return () => undefined;
}

function restoredHref(href: string): string {
  const pathname = hrefPathname(href);

  if (!pathname) {
    return href;
  }

  try {
    return resolvedBackHref(href, sessionStorage.getItem(returnStorageKey(pathname)));
  } catch {
    return href;
  }
}

export function BackLink({ href, children }: BackLinkProps) {
  const target = useSyncExternalStore(subscribe, () => restoredHref(href), () => href);

  return (
    <p>
      <Link
        href={target}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <ArrowLeft className="size-4 shrink-0" aria-hidden />
        {children}
      </Link>
    </p>
  );
}
