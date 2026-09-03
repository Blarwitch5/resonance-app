import { FaceSlightlySmilingPlus, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { ButtonLink } from "@/components/ui/button";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { eyebrowClass } from "@/components/ui/type";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

export default async function HomePage() {
  const session = await getSession();

  if (session) {
    redirect("/collection");
  }

  const locale = await getLocale();

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-6">
      <div className="ripple-in max-w-md text-center">
        <ResonanceMark size="lg" className="mx-auto" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-text sm:text-5xl">
          {t(locale, "brand.tagline")}
        </h1>
        <p className="mt-4 text-base leading-7 text-text-secondary">
          {t(locale, "brand.description")}
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <ButtonLink href="/sign-up">
            <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
            {t(locale, "brand.startJournal")}
          </ButtonLink>
          <ButtonLink href="/sign-in" variant="ghost">
            <LogIn className="size-4 shrink-0" aria-hidden />
            {t(locale, "brand.welcomeBack")}
          </ButtonLink>
        </div>
      </div>
    </div>
  );
}
