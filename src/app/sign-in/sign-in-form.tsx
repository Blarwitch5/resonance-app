"use client";

import { Lock, LogIn, Mail } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";
import { useLocale, useT } from "@/components/locale-provider";

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
        setError(result.error.message || t("auth.credentials"));
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
    <form onSubmit={handleSubmit} className="mt-8 flex flex-col gap-5">
      <TextField
        id="email"
        name="email"
        type="email"
        label={t("common.email")}
        autoComplete="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        icon={Mail}
      />
      <TextField
        id="password"
        name="password"
        type="password"
        label={t("common.password")}
        autoComplete="current-password"
        required
        minLength={8}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        icon={Lock}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <LogIn className="size-4 shrink-0" aria-hidden />
        {isSubmitting ? t("auth.listening") : t("auth.enter")}
      </Button>
    </form>
  );
}
