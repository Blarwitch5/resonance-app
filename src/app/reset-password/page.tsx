import Link from "next/link";
import { redirect } from "next/navigation";

import { ResetPasswordForm } from "@/app/reset-password/reset-password-form";
import { AuthDoor } from "@/components/layouts/auth-door";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

interface ResetPasswordPageProps {
  searchParams: Promise<{ token?: string; error?: string }>;
}

export default async function ResetPasswordPage({ searchParams }: ResetPasswordPageProps) {
  const session = await getSession();
  const locale = await getLocale();
  const { token, error } = await searchParams;

  if (session) {
    redirect("/collection");
  }

  const isInvalid = Boolean(error) || !token;

  return (
    <AuthDoor
      title={t(locale, "auth.newPasswordTitle")}
      description={isInvalid ? t(locale, "auth.newPasswordInvalid") : t(locale, "auth.newPasswordBody")}
      tagline={t(locale, "brand.tagline")}
      footer={
        <Link href="/sign-in" className="font-medium text-primary hover:text-primary-hover">
          {t(locale, "auth.backToSignIn")}
        </Link>
      }
    >
      {isInvalid || !token ? null : <ResetPasswordForm token={token} />}
    </AuthDoor>
  );
}
