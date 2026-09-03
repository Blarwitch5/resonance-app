import { parseLocale, type Locale } from "@/lib/settings/types";

export const LOCALE_COOKIE = "resonance-locale";

export function localeFromCookie(cookieHeader: string | undefined): Locale {
  if (!cookieHeader) {
    return "en";
  }

  const prefix = `${LOCALE_COOKIE}=`;

  for (const part of cookieHeader.split(";")) {
    const trimmed = part.trim();

    if (!trimmed.startsWith(prefix)) {
      continue;
    }

    try {
      return parseLocale(decodeURIComponent(trimmed.slice(prefix.length))) ?? "en";
    } catch {
      return "en";
    }
  }

  return "en";
}
