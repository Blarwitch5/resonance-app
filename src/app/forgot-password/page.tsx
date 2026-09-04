import Link from "next/link";
import { redirect } from "next/navigation";

import { ForgotPasswordForm } from "@/app/forgot-password/forgot-password-form";
import { AuthDoor } from "@/components/layouts/auth-door";
import { t } from "@/lib/i18n/translate";
import { getLocale } from "@/lib/i18n/locale";
import { getSession } from "@/lib/session";

export default async function ForgotPasswordPage() {
  const session = await getSession();
  const locale = await getLocale();

  if (session) {
    redirect("/collection");
  }

  return (
    <AuthDoor
      title={t(locale, "auth.resetTitle")}
      description={t(locale, "auth.resetBody")}
      tagline={t(locale, "brand.tagline")}
      footer={
        <Link href="/sign-in" className="font-medium text-primary hover:text-primary-hover">
          {t(locale, "auth.backToSignIn")}
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthDoor>
  );
}
