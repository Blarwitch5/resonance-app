"use client";

import { Bookmark, Heart, Library } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { useT } from "@/components/locale-provider";
import { profileHref, type ProfileQuery, type ProfileTab } from "@/lib/profile/types";

interface ProfileChipsProps {
  active: ProfileTab;
  query?: string;
}

export function ProfileChips({ active, query }: ProfileChipsProps) {
  const t = useT();
  const tabs: Array<{
    tab: ProfileTab;
    label: string;
    icon: typeof Heart;
  }> = [
    { tab: "resonance", label: t("profile.resonance"), icon: Library },
    { tab: "close", label: t("profile.keptClose"), icon: Heart },
    { tab: "waiting", label: t("profile.waiting"), icon: Bookmark },
  ];

  return (
    <nav aria-label={t("nav.profile")} className="flex flex-wrap gap-2 lg:hidden">
      {tabs.map((entry) => {
        const Icon = entry.icon;
        const listen: ProfileQuery =
          entry.tab === "close" || entry.tab === "waiting" ? { tab: entry.tab, query } : { tab: entry.tab };

        return (
          <ChipLink key={entry.tab} href={profileHref(listen)} isActive={active === entry.tab} className="group">
            <Icon className="size-4 shrink-0 motion-safe:group-hover:vibrato" aria-hidden />
            {entry.label}
          </ChipLink>
        );
      })}
    </nav>
  );
}
