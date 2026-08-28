"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { isMainNavActive, MAIN_NAV, sidebarSubNavKind } from "@/components/ui/main-nav";
import { ResonanceLockup } from "@/components/ui/resonance-mark";
import { useMainNavHrefs } from "@/components/ui/use-main-nav-href";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface SidebarProps {
  formatNav?: ReactNode;
  profileNav?: ReactNode;
  locale?: Locale;
}

export function Sidebar({ formatNav, profileNav, locale = "en" }: SidebarProps) {
  const pathname = usePathname();
  const hrefs = useMainNavHrefs();

  return (
    <aside className="hidden w-60 shrink-0 border-r border-border bg-surface transition-colors duration-500 lg:flex lg:flex-col">
      <div className="px-6 py-8">
        <ResonanceLockup tagline="Where your music resonates." />
      </div>
      <nav aria-label={t(locale, "nav.main")} className="flex flex-1 flex-col gap-2 px-3">
        {MAIN_NAV.map((link) => {
          const isActive = isMainNavActive(pathname, link.href);
          const Icon = link.icon;
          const kind = sidebarSubNavKind(link.href);
          const subNav = kind === "collection" ? formatNav : kind === "profile" ? profileNav : null;

          return (
            <div key={link.href} className="flex flex-col gap-1">
              <Link
                href={hrefs[link.href]}
                aria-current={isActive ? "page" : undefined}
                className={`group flex min-h-11 items-center gap-3 rounded-rs-sm px-3 text-sm font-medium transition-colors outline-none focus-visible:ring-2 focus-visible:ring-border-strong ${
                  isActive
                    ? "bg-primary-soft text-on-primary-soft"
                    : "text-text-secondary hover:bg-surface-pressed hover:text-text"
                }`}
              >
                <Icon className="size-5 motion-safe:group-hover:vibrato" aria-hidden />
                {t(locale, `nav.${link.id}`)}
              </Link>
              {subNav}
            </div>
          );
        })}
      </nav>
    </aside>
  );
}
