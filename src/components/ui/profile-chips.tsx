import { Bookmark, Heart, Library } from "lucide-react";

import { ChipLink } from "@/components/ui/chip";
import { profileHref, type ProfileQuery, type ProfileTab } from "@/lib/profile/types";

interface ProfileChipsProps {
  active: ProfileTab;
  query?: string;
}

const TABS: Array<{
  tab: ProfileTab;
  label: string;
  icon: typeof Heart;
}> = [
  { tab: "resonance", label: "Resonance", icon: Library },
  { tab: "close", label: "Kept close", icon: Heart },
  { tab: "waiting", label: "Waiting", icon: Bookmark },
];

export function ProfileChips({ active, query }: ProfileChipsProps) {
  return (
    <nav aria-label="Profile" className="flex flex-wrap gap-2 lg:hidden">
      {TABS.map((entry) => {
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
