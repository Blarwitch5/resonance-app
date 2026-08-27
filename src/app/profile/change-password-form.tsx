"use client";

import { KeyRound, Lock } from "lucide-react";
import { useActionState, useEffect, useRef } from "react";

import { changePasswordAction, type ChangePasswordState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { MAX_PASSWORD_LENGTH, MIN_PASSWORD_LENGTH } from "@/lib/profile/password";

const initialState: ChangePasswordState = { error: null, changed: false };

export function ChangePasswordForm() {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction, isPending] = useActionState(changePasswordAction, initialState);

  useEffect(() => {
    if (state.changed) {
      formRef.current?.reset();
    }
  }, [state.changed]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        Other devices will need to sign in again.
      </p>
      <TextField
        id="currentPassword"
        name="currentPassword"
        type="password"
        label="Current password"
        autoComplete="current-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={Lock}
      />
      <TextField
        id="newPassword"
        name="newPassword"
        type="password"
        label="New password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={KeyRound}
      />
      <TextField
        id="confirmPassword"
        name="confirmPassword"
        type="password"
        label="Confirm new password"
        autoComplete="new-password"
        required
        minLength={MIN_PASSWORD_LENGTH}
        maxLength={MAX_PASSWORD_LENGTH}
        icon={KeyRound}
      />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.changed ? <Notice tone="success">Your password is updated.</Notice> : null}
      <Button type="submit" disabled={isPending}>
        <Lock className="size-4 shrink-0" aria-hidden />
        {isPending ? "Saving…" : "Change password"}
      </Button>
    </form>
  );
}
