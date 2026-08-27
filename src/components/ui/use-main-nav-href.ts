"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { emptyStoredReturns, mainNavHref, readStoredReturns } from "@/components/return-path";
import { MAIN_NAV } from "@/components/ui/main-nav";

export function useMainNavHrefs(): Record<(typeof MAIN_NAV)[number]["href"], string> {
  const pathname = usePathname();
  const [search, setSearch] = useState("");
  const [stored, setStored] = useState(emptyStoredReturns);

  useEffect(() => {
    setSearch(window.location.search);
    setStored(readStoredReturns());
  }, [pathname]);

  const location = { pathname, search };

  return {
    "/collection": mainNavHref("/collection", location, stored["/collection"]),
    "/explorer": mainNavHref("/explorer", location, stored["/explorer"]),
    "/profile": mainNavHref("/profile", location, stored["/profile"]),
  };
}
