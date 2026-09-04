import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { WelcomeForm } from "@/app/welcome/welcome-form";
import { AuthDoor } from "@/components/layouts/auth-door";
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
    <AuthDoor
      title={t(locale, "welcome.heading")}
      description={t(locale, "welcome.body")}
      tagline={t(locale, "brand.tagline")}
    >
      <div className="mt-8">
        <WelcomeForm />
      </div>
    </AuthDoor>
  );
}
