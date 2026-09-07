import Link from "next/link";

import { FaceSlightlySmilingPlus, LogIn } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CoverArt } from "@/components/ui/cover-art";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass, hintClass, recordTitleClass } from "@/components/ui/type";
import { signInHref, signUpHref } from "@/lib/auth-path";
import { coverAlt } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import { listenAddHref, listenDiscogsHref } from "@/lib/listen/href";
import type { SharedShelfSnapshot } from "@/lib/listen/types";
import type { Locale } from "@/lib/settings/types";

interface ListenShelfPageProps {
  shelf: SharedShelfSnapshot;
  isSignedIn: boolean;
  locale: Locale;
}

export function ListenShelfPage({ shelf, isSignedIn, locale }: ListenShelfPageProps) {
  const door = isSignedIn ? "/collection" : signInHref("/collection");

  return (
    <div className="flex min-h-dvh justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-3xl flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <ResonanceMark size="sm" />
          <p className={eyebrowClass}>Resonance</p>
          {shelf.sharerName ? (
            <p className={hintClass}>{t(locale, "listen.from", { name: shelf.sharerName })}</p>
          ) : null}
          <h1 className={displayTitleClass}>{shelf.headline}</h1>
          <p className={bodyClass}>
            {shelf.truncated
              ? t(locale, "listen.shelfCountMore", { count: shelf.items.length })
              : t(locale, "listen.shelfCount", { count: shelf.items.length })}
          </p>
        </div>

        <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          {shelf.items.map((item, index) => {
            const href =
              item.discogsId !== null
                ? (listenDiscogsHref(item.discogsId) ?? listenAddHref(item))
                : listenAddHref(item);
            const target = isSignedIn ? href : signInHref(href);

            return (
              <li key={`${item.artist}-${item.title}-${index}`}>
                <Link
                  href={target}
                  className="group flex flex-col gap-2 outline-none focus-visible:ring-2 focus-visible:ring-border-strong"
                >
                  <CoverArt
                    url={item.coverUrl}
                    compactUrl={item.coverThumbUrl}
                    alt={coverAlt(locale, item.title, item.artist)}
                    sizes="(max-width: 640px) 45vw, 200px"
                    priority={index < 6}
                    isInteractive
                  />
                  <p className={`${recordTitleClass} line-clamp-2`}>{item.title}</p>
                  <p className={`${hintClass} line-clamp-1`}>{item.artist}</p>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="flex flex-col gap-3">
          <ButtonLink href={door} className="w-full">
            <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
            {isSignedIn ? t(locale, "listen.openShelf") : t(locale, "listen.add")}
          </ButtonLink>
          {!isSignedIn ? (
            <ButtonLink href={signUpHref("/collection")} variant="ghost" className="w-full">
              <LogIn className="size-4 shrink-0" aria-hidden />
              {t(locale, "listen.startJournal")}
            </ButtonLink>
          ) : null}
        </div>
      </div>
    </div>
  );
}
