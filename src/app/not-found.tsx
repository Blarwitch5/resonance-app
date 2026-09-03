import type { Metadata } from "next";

import { ButtonLink } from "@/components/ui/button";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: t(locale, "notFound.document") };
}

export default async function NotFoundPage() {
  const locale = await getLocale();

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="max-w-md text-center">
        <ResonanceMark size="md" className="mx-auto" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className={`mt-3 ${displayTitleClass}`}>{t(locale, "notFound.title")}</h1>
        <p className={`mt-2 ${bodyClass}`}>
          {t(locale, "notFound.body")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/collection">{t(locale, "back.collection")}</ButtonLink>
          <ButtonLink href="/explorer" variant="ghost">
            {t(locale, "notFound.findRecord")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
