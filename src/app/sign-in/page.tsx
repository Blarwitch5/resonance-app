import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/app/sign-in/sign-in-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { safeNextHref, signUpHref } from "@/lib/auth-path";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

interface SignInPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession();
  const { next } = await searchParams;
  const nextPath = safeNextHref(next);
  const locale = await getLocale();

  if (session) {
    redirect(nextPath);
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className={`mt-3 ${displayTitleClass}`}>{t(locale, "auth.welcomeBack")}</h1>
        <p className={`mt-2 ${bodyClass}`}>{t(locale, "auth.stillVibrating")}</p>
        <SignInForm nextPath={nextPath} />
        <p className={`mt-6 ${bodyClass}`}>
          {t(locale, "auth.newHere")}{" "}
          <Link href={signUpHref(next)} className="font-medium text-primary hover:text-primary-hover">
            {t(locale, "auth.startJournal")}
          </Link>
        </p>
      </div>
    </div>
  );
}
