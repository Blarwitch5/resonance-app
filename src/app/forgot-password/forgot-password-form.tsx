"use client";

import { Mail, Send } from "lucide-react";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useLocale, useT } from "@/components/locale-provider";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";

export function ForgotPasswordForm() {
  const t = useT();
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSent, setIsSent] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.requestPasswordReset({
        email,
        redirectTo: "/reset-password",
      });

      if (result.error) {
        setError(t("auth.resetCouldNotSend"));
        return;
      }

      setIsSent(true);
    } catch (caught) {
      setError(localizedError(locale, caught));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSent) {
    return (
      <div className="mt-8">
        <Notice tone="success">{t("auth.resetSent")}</Notice>
      </div>
    );
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
        disabled={isSubmitting}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <BusyGlyph isBusy={isSubmitting}>
          <Send className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isSubmitting ? t("auth.resetSending") : t("auth.resetSend")}
      </Button>
    </form>
  );
}
