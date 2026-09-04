import Link from "next/link";
import { redirect } from "next/navigation";

import { SignInForm } from "@/app/sign-in/sign-in-form";
import { AuthDoor } from "@/components/layouts/auth-door";
import { Notice } from "@/components/ui/notice";
import { safeNextHref, signUpHref } from "@/lib/auth-path";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

interface SignInPageProps {
  searchParams: Promise<{ next?: string; reset?: string }>;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const session = await getSession();
  const { next, reset } = await searchParams;
  const nextPath = safeNextHref(next);
  const locale = await getLocale();

  if (session) {
    redirect(nextPath);
  }

  return (
    <AuthDoor
      title={t(locale, "auth.welcomeBack")}
      description={t(locale, "auth.stillVibrating")}
      tagline={t(locale, "brand.tagline")}
      notice={
        reset === "1" ? (
          <div className="mt-6">
            <Notice tone="success">{t(locale, "auth.newPasswordSaved")}</Notice>
          </div>
        ) : null
      }
      footer={
        <>
          {t(locale, "auth.newHere")}{" "}
          <Link href={signUpHref(next)} className="font-medium text-primary hover:text-primary-hover">
            {t(locale, "auth.startJournal")}
          </Link>
        </>
      }
    >
      <SignInForm nextPath={nextPath} />
    </AuthDoor>
  );
}
