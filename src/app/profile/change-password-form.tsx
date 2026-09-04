"use client";

import { KeyRound, Lock } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { changePasswordAction, type ChangePasswordState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { PasswordField } from "@/components/ui/password-field";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/profile/password";

const initialState: ChangePasswordState = { error: null, changed: false };

export function ChangePasswordForm() {
  const t = useT();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.changed) {
      formRef.current?.reset();
    }
  }, [state.changed]);

  return (
    <form ref={formRef} action={formAction} aria-busy={isPending} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("password.hint")}
      </p>
      <PasswordField
        id="currentPassword"
        name="currentPassword"
        label={t("password.current")}
        autoComplete="current-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={Lock}
      />
      <PasswordField
        id="newPassword"
        name="newPassword"
        label={t("password.next")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={KeyRound}
      />
      <PasswordField
        id="confirmPassword"
        name="confirmPassword"
        label={t("password.confirm")}
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={KeyRound}
      />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.changed ? <Notice tone="success">{t("password.updated")}</Notice> : null}
      <Button type="submit" disabled={isPending}>
        <Lock className="size-4 shrink-0" aria-hidden />
        {isPending ? t("password.saving") : t("password.change")}
      </Button>
    </form>
  );
}
