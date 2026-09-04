import Link from "next/link";
import { redirect } from "next/navigation";

import { SignUpForm } from "@/app/sign-up/sign-up-form";
import { AuthDoor } from "@/components/layouts/auth-door";
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
    <AuthDoor
      title={t(locale, "auth.startSound")}
      description={t(locale, "auth.everyRecord")}
      tagline={t(locale, "brand.tagline")}
      footer={
        <>
          {t(locale, "auth.alreadyCollecting")}{" "}
          <Link href={signInHref(next)} className="font-medium text-primary hover:text-primary-hover">
            {t(locale, "auth.signIn")}
          </Link>
        </>
      }
    >
      <SignUpForm />
    </AuthDoor>
  );
}
