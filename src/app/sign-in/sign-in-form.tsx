"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { PasswordField } from "@/components/ui/password-field";
import { Notice } from "@/components/ui/notice";
import { useLocale, useT } from "@/components/locale-provider";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/profile/password";

interface SignInFormProps {
  nextPath: string;
}

export function SignInForm({ nextPath }: SignInFormProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signIn.email({
        email,
        password,
        callbackURL: nextPath,
      });

      if (result.error) {
        setError(t("auth.credentials"));
        return;
      }

      router.push(nextPath);
      router.refresh();
    } catch (caught) {
      setError(localizedError(locale, caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="mt-8 flex flex-col gap-5">
      <TextField
        id="email"
        name="email"
        type="email"
        label={t("common.email")}
        autoComplete="email"
        autoFocus
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        icon={Mail}
      />
      <PasswordField
        id="password"
        name="password"
        label={t("common.password")}
        autoComplete="current-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        icon={Lock}
      />
      <p className="text-right text-sm leading-6">
        <Link href="/forgot-password" className="text-text-secondary hover:text-primary">
          {t("auth.forgotPassword")}
        </Link>
      </p>
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LogIn className="size-4 shrink-0" aria-hidden />
        {isSubmitting ? t("auth.listening") : t("auth.enter")}
      </Button>
    </form>
  );
}
