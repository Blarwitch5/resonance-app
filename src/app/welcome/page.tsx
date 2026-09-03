import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WelcomeForm } from "@/app/welcome/welcome-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { hasShelfItems } from "@/lib/collection/repository";
import { getLocale } from "@/lib/i18n/locale";
import { t } from "@/lib/i18n/translate";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";

export async function generateMetadata(): Promise<Metadata> {
  return { title: t(await getLocale(), "document.welcome") };
}

export default async function WelcomePage() {
  const session = await requireSession();
  const [settings, hasItems] = await Promise.all([
    getUserSettings(session.user.id),
    hasShelfItems(session.user.id),
  ]);

  if (settings.onboardedAt !== null || hasItems) {
    redirect("/collection");
  }

  const locale = settings.locale;

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="ripple-in w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className={`mt-3 ${displayTitleClass}`}>{t(locale, "welcome.heading")}</h1>
        <p className={`mt-2 ${bodyClass}`}>
          {t(locale, "welcome.body")}
        </p>
        <div className="mt-8">
          <WelcomeForm />
        </div>
      </div>
    </div>
  );
}
