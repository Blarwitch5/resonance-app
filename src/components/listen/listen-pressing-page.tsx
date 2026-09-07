import { FaceSlightlySmilingPlus, LogIn } from "lucide-react";

import { ButtonLink } from "@/components/ui/button";
import { CoverArt } from "@/components/ui/cover-art";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass, hintClass } from "@/components/ui/type";
import { signInHref, signUpHref } from "@/lib/auth-path";
import { coverAlt, formatLabel } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { ListenPressingView } from "@/lib/listen/types";
import type { Locale } from "@/lib/settings/types";

interface ListenPressingPageProps {
  view: ListenPressingView;
  addHref: string;
  isSignedIn: boolean;
  locale: Locale;
  discogsHref?: string | null;
}

export function ListenPressingPage({
  view,
  addHref,
  isSignedIn,
  locale,
  discogsHref = null,
}: ListenPressingPageProps) {
  const meta = [
    formatLabel(locale, view.format),
    view.year !== null ? String(view.year) : null,
    view.label,
    ...view.genres.slice(0, 3),
  ].filter((part): part is string => Boolean(part && part.trim().length > 0));

  const doorHref = isSignedIn ? addHref : signInHref(addHref);

  return (
    <div className="flex min-h-dvh justify-center bg-background px-4 py-10 sm:px-6">
      <div className="flex w-full max-w-lg flex-col gap-8">
        <div className="flex flex-col items-center gap-3 text-center">
          <ResonanceMark size="sm" />
          <p className={eyebrowClass}>Resonance</p>
          {view.sharerName ? (
            <p className={hintClass}>{t(locale, "listen.from", { name: view.sharerName })}</p>
          ) : null}
        </div>

        <CoverArt
          url={view.coverUrl}
          compactUrl={view.coverThumbUrl}
          alt={coverAlt(locale, view.title, view.artist)}
          sizes="(max-width: 640px) 90vw, 512px"
          className="mx-auto w-full max-w-sm"
          priority
        />

        <div className="flex flex-col gap-3 text-center">
          <h1 className={displayTitleClass}>{view.title}</h1>
          <p className={bodyClass}>{view.artist}</p>
          {meta.length > 0 ? <p className={hintClass}>{meta.join(" · ")}</p> : null}
        </div>

        <div className="flex flex-col gap-3">
          <ButtonLink href={doorHref} className="w-full">
            <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
            {t(locale, "listen.add")}
          </ButtonLink>
          {!isSignedIn ? (
            <ButtonLink href={signUpHref(addHref)} variant="ghost" className="w-full">
              <LogIn className="size-4 shrink-0" aria-hidden />
              {t(locale, "listen.startJournal")}
            </ButtonLink>
          ) : null}
          {discogsHref ? (
            <a
              href={discogsHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex min-h-11 items-center justify-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
            >
              {t(locale, "listen.onDiscogs")}
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}
