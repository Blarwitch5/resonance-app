"use client";

import { Layers } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { formatIcons, formatLabels } from "@/components/ui/format-icon";
import { SidebarSubLink, SidebarSubNav } from "@/components/ui/sidebar-sub-nav";
import { collectionFormatNavHref } from "@/lib/collection/href";
import { parseMediaFormat, type MediaFormat } from "@/lib/collection/types";

interface CollectionFormatNavProps {
  formats: MediaFormat[];
}

export function CollectionFormatNav({ formats }: CollectionFormatNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const search = searchParams.toString();
  const requested = pathname === "/collection" ? parseMediaFormat(searchParams.get("format") ?? undefined) : undefined;
  const active = requested && formats.includes(requested) ? requested : undefined;

  return (
    <SidebarSubNav label="Format">
      <SidebarSubLink
        href={collectionFormatNavHref(pathname, search)}
        isActive={!active && pathname === "/collection"}
        icon={Layers}
        label="All"
      />
      {formats.map((format) => (
        <SidebarSubLink
          key={format}
          href={collectionFormatNavHref(pathname, search, format)}
          isActive={active === format}
          icon={formatIcons[format]}
          label={formatLabels[format]}
        />
      ))}
    </SidebarSubNav>
  );
}
