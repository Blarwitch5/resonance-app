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
import { useT } from "@/components/locale-provider";

export function ProfileNav() {
  const t = useT();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const isOnProfile = pathname === "/profile";
  const query = isOnProfile ? (searchParams.get("q") ?? "").trim() || undefined : undefined;
  const tab = parseProfileTab(isOnProfile ? (searchParams.get("tab") ?? undefined) : undefined, Boolean(query));
  const settings = isOnProfile
    ? parseSettingsFlag(searchParams.get("settings") ?? undefined, searchParams.get("tab") ?? undefined)
    : false;
  const listen = { tab, query };
  const items: Array<{ id: ProfileNavId; label: string; icon: LucideIcon }> = [
    { id: "resonance", label: t("profile.resonance"), icon: Library },
    { id: "close", label: t("profile.keptClose"), icon: Heart },
    { id: "waiting", label: t("profile.waiting"), icon: Bookmark },
    { id: "settings", label: t("settings.title"), icon: Settings },
  ];

  return (
    <SidebarSubNav label={t("nav.profile")}>
      {items.map((item) => (
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
