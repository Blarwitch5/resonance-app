"use client";

import { createContext, useContext, type ReactNode } from "react";

import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

const LocaleContext = createContext<Locale | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  return useContext(LocaleContext) ?? "en";
}

export function useT() {
  const locale = useLocale();

  return (path: string, vars?: Record<string, string | number>) => t(locale, path, vars);
}
