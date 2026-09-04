import "server-only";

import { cookies } from "next/headers";

import { LOCALE_COOKIE } from "@/lib/i18n/cookie";
import { parseLocale, type Locale } from "@/lib/settings/types";

export { LOCALE_COOKIE };

export async function getLocale(): Promise<Locale> {
  const stored = (await cookies()).get(LOCALE_COOKIE)?.value;
  return parseLocale(stored) ?? "en";
}

export async function persistLocaleCookie(locale: Locale): Promise<void> {
  (await cookies()).set(LOCALE_COOKIE, locale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
