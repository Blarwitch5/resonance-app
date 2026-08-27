"use client";

import { Bookmark, Heart, Library, Settings, type LucideIcon } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";

import { SidebarSubLink, SidebarSubNav } from "@/components/ui/sidebar-sub-nav";
import {
  isProfileNavActive,
  parseProfileTab,
  parseSettingsFlag,
  profileNavHrefForPath,
  type ProfileNavId,
} from "@/lib/profile/types";

const ITEMS: Array<{ id: ProfileNavId; label: string; icon: LucideIcon }> = [
  { id: "resonance", label: "Resonance", icon: Library },
  { id: "close", label: "Kept close", icon: Heart },
  { id: "waiting", label: "Waiting", icon: Bookmark },
  { id: "settings", label: "Settings", icon: Settings },
];

export function ProfileNav() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnProfile = pathname === "/profile";
  const query = isOnProfile ? (searchParams.get("q") ?? "").trim() || undefined : undefined;
  const tab = parseProfileTab(isOnProfile ? (searchParams.get("tab") ?? undefined) : undefined, Boolean(query));
  const settings = isOnProfile
    ? parseSettingsFlag(searchParams.get("settings") ?? undefined, searchParams.get("tab") ?? undefined)
    : false;
  const listen = { tab, query };

  return (
    <SidebarSubNav label="Profile">
      {ITEMS.map((item) => (
        <SidebarSubLink
          key={item.id}
          href={profileNavHrefForPath(item.id, pathname, listen)}
          isActive={isOnProfile && isProfileNavActive(item.id, { tab, settings })}
          icon={item.icon}
          label={item.label}
        />
      ))}
    </SidebarSubNav>
  );
}
