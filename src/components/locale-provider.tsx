"use client";

import { createContext, useContext, useSyncExternalStore, type ReactNode } from "react";

import { t } from "@/lib/i18n/translate";
import { parseLocale, type Locale } from "@/lib/settings/types";

const LocaleContext = createContext<Locale | null>(null);

interface LocaleProviderProps {
  locale: Locale;
  children: ReactNode;
}

function subscribeDocumentLang(onChange: () => void): () => void {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => observer.disconnect();
}

function readDocumentLang(): Locale {
  return parseLocale(document.documentElement.lang) ?? "en";
}

export function LocaleProvider({ locale, children }: LocaleProviderProps) {
  return <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>;
}

export function useLocale(): Locale {
  const fromContext = useContext(LocaleContext);
  const fromDocument = useSyncExternalStore(subscribeDocumentLang, readDocumentLang, () => fromContext ?? "en");

  return fromContext ?? fromDocument;
}

export function useT() {
  const locale = useLocale();

  return (path: string, vars?: Record<string, string | number>) => t(locale, path, vars);
}
