import { FaceSlightlySmilingPlus, LogIn } from "lucide-react";
import { redirect } from "next/navigation";

import { AuthDoor } from "@/components/layouts/auth-door";
import { ButtonLink } from "@/components/ui/button";
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
    <AuthDoor
      title={t(locale, "auth.startSound")}
      description={t(locale, "brand.description")}
      tagline={t(locale, "brand.tagline")}
    >
      <div className="mt-8 flex flex-col gap-3">
        <ButtonLink href="/sign-up" className="w-full">
          <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
          {t(locale, "brand.startJournal")}
        </ButtonLink>
        <ButtonLink href="/sign-in" variant="ghost" className="w-full">
          <LogIn className="size-4 shrink-0" aria-hidden />
          {t(locale, "brand.welcomeBack")}
        </ButtonLink>
      </div>
    </AuthDoor>
  );
}
