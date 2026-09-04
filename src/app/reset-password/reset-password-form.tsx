"use client";

import { KeyRound, Lock } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useLocale, useT } from "@/components/locale-provider";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH, parsePasswordReset, passwordResetFailure } from "@/lib/profile/password";

interface ResetPasswordFormProps {
  token: string;
}

export function ResetPasswordForm({ token }: ResetPasswordFormProps) {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const parsed = parsePasswordReset({ next: password, confirm }, locale);

    if (!parsed.ok) {
      setError(parsed.message);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await authClient.resetPassword({
        newPassword: parsed.newPassword,
        token,
      });

      if (result.error) {
        setError(passwordResetFailure(result.error, locale));
        setIsSubmitting(false);
        return;
      }

      router.push("/sign-in?reset=1");
      router.refresh();
    } catch (caught) {
      setError(localizedError(locale, caught));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="mt-8 flex flex-col gap-5">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5 border-0 p-0">
      <PasswordField
        id="newPassword"
        name="newPassword"
        label={t("password.next")}
        autoComplete="new-password"
        autoFocus
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        icon={Lock}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t("password.confirm")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        value={confirm}
        onChange={(event) => setConfirm(event.target.value)}
        icon={KeyRound}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <BusyGlyph isBusy={isSubmitting}>
          <Lock className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isSubmitting ? t("auth.newPasswordSaving") : t("auth.newPasswordSave")}
      </Button>
      </fieldset>
    </form>
  );
}
