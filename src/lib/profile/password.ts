import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export const MIN_PASSWORD_LENGTH = 8;
export const MAX_PASSWORD_LENGTH = 128;

export type PasswordChangeResult =
  | { ok: true; currentPassword: string; newPassword: string }
  | { ok: false; message: string };

export function parsePasswordChange(
  input: {
    current: string;
    next: string;
    confirm: string;
  },
  locale: Locale = "en",
): PasswordChangeResult {
  if (input.current.length === 0) {
    return { ok: false, message: t(locale, "password.enterCurrent") };
  }

  if (input.next.length < MIN_PASSWORD_LENGTH) {
    return { ok: false, message: t(locale, "password.tooShort") };
  }

  if (input.next.length > MAX_PASSWORD_LENGTH) {
    return { ok: false, message: t(locale, "password.tooLong") };
  }

  if (input.next !== input.confirm) {
    return { ok: false, message: t(locale, "password.mismatch") };
  }

  if (input.next === input.current) {
    return { ok: false, message: t(locale, "password.sameAsNow") };
  }

  return {
    ok: true,
    currentPassword: input.current,
    newPassword: input.next,
  };
}

export function passwordChangeFailure(error: unknown, locale: Locale = "en"): string {
  const code = authErrorCode(error);

  if (code === "INVALID_PASSWORD") {
    return t(locale, "password.wrongCurrent");
  }

  if (code === "PASSWORD_TOO_SHORT") {
    return t(locale, "password.tooShort");
  }

  if (code === "PASSWORD_TOO_LONG") {
    return t(locale, "password.tooLong");
  }

  return t(locale, "password.failed");
}

function authErrorCode(error: unknown): string | undefined {
  if (typeof error !== "object" || error === null) {
    return undefined;
  }

  if ("body" in error && typeof error.body === "object" && error.body !== null && "code" in error.body) {
    const code = error.body.code;
    return typeof code === "string" ? code : undefined;
  }

  if ("code" in error && typeof error.code === "string") {
    return error.code;
  }

  return undefined;
}
