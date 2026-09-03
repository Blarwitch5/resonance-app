"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { glassPanelClass } from "@/components/ui/chrome";
import { isMainNavActive, MAIN_NAV } from "@/components/ui/main-nav";
import { useMainNavHrefs } from "@/components/ui/use-main-nav-href";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

interface BottomBarProps {
  locale?: Locale;
}

export function BottomBar({ locale = "en" }: BottomBarProps) {
  const pathname = usePathname();
  const hrefs = useMainNavHrefs();

  return (
    <nav
      aria-label={t(locale, "nav.main")}
      className={`fixed right-3 bottom-[max(0.75rem,env(safe-area-inset-bottom))] left-3 z-40 rounded-rs-lg lg:hidden ${glassPanelClass}`}
    >
      <ul className="mx-auto flex max-w-lg items-stretch justify-around px-2 py-1">
        {MAIN_NAV.map((tab) => {
          const isActive = isMainNavActive(pathname, tab.href);
          const Icon = tab.icon;

          return (
            <li key={tab.href} className="flex-1">
              <Link
                href={hrefs[tab.href]}
                aria-current={isActive ? "page" : undefined}
                className={`group mx-1 flex min-h-14 flex-col items-center justify-center gap-1 rounded-rs-md text-xs font-medium transition-colors outline-none standalone:min-h-12 focus-visible:ring-2 focus-visible:ring-border-strong ${
                  isActive
                    ? "bg-primary-soft text-on-primary-soft"
                    : "text-text-secondary hover:bg-surface-pressed hover:text-text"
                }`}
              >
                <Icon
                  className={`size-5 motion-safe:group-hover:vibrato ${isActive ? "motion-safe:animate-[ripple_500ms_ease-out]" : ""}`}
                  aria-hidden
                />
                {t(locale, `nav.${tab.id}`)}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
