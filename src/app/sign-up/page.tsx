import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/app/sign-up/sign-up-form";
import { ResonanceMark } from "@/components/ui/resonance-mark";
import { bodyClass, displayTitleClass, eyebrowClass } from "@/components/ui/type";
import { signInHref } from "@/lib/auth-path";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

interface SignUpPageProps {
  searchParams: Promise<{ next?: string }>;
}

export default async function SignUpPage({ searchParams }: SignUpPageProps) {
  const session = await getSession();
  const { next } = await searchParams;
  const locale = await getLocale();

  if (session) {
    redirect("/welcome");
  }

  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-6">
      <div className="w-full max-w-sm">
        <ResonanceMark size="md" />
        <p className={`mt-4 ${eyebrowClass}`}>Resonance</p>
        <h1 className={`mt-3 ${displayTitleClass}`}>{t(locale, "auth.startSound")}</h1>
        <p className={`mt-2 ${bodyClass}`}>{t(locale, "auth.everyRecord")}</p>
        <SignUpForm />
        <p className={`mt-6 ${bodyClass}`}>
          {t(locale, "auth.alreadyCollecting")}{" "}
          <Link href={signInHref(next)} className="font-medium text-primary hover:text-primary-hover">
            {t(locale, "auth.signIn")}
          </Link>
        </p>
      </div>
    </div>
  );
}
