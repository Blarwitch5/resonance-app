"use client";

import { FaceSlightlySmilingPlus, Lock, Mail, UserRound } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { PasswordField } from "@/components/ui/password-field";
import { useLocale, useT } from "@/components/locale-provider";
import { authClient } from "@/lib/auth-client";
import { localizedError } from "@/lib/i18n/action-error";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/profile/password";

export function SignUpForm() {
  const t = useT();
  const locale = useLocale();
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await authClient.signUp.email({
        name,
        email,
        password,
        callbackURL: "/welcome",
      });

      if (result.error) {
        setError(t("auth.couldNotOpen"));
        setIsSubmitting(false);
        return;
      }

      router.push("/welcome");
      router.refresh();
    } catch (caught) {
      setError(localizedError(locale, caught));
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={isSubmitting} className="mt-8 flex flex-col gap-5">
      <fieldset disabled={isSubmitting} className="flex flex-col gap-5 border-0 p-0">
      <TextField
        id="name"
        name="name"
        type="text"
        label={t("common.name")}
        autoComplete="name"
        autoFocus
        required
        value={name}
        onChange={(event) => setName(event.target.value)}
        icon={UserRound}
      />
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
      <PasswordField
        id="password"
        name="password"
        label={t("common.password")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        value={password}
        onChange={(event) => setPassword(event.target.value)}
        icon={Lock}
      />
      {error ? <Notice tone="error">{error}</Notice> : null}
      <Button type="submit" disabled={isSubmitting} className="w-full">
        <BusyGlyph isBusy={isSubmitting}>
          <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isSubmitting ? t("auth.opening") : t("auth.createJournal")}
      </Button>
      </fieldset>
    </form>
  );
}
