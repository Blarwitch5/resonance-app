import type { MediaCondition, MediaFormat } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export function formatLabel(locale: Locale, format: MediaFormat): string {
  return t(locale, `format.${format}`);
}

export function conditionLabel(locale: Locale, condition: MediaCondition): string {
  return t(locale, `condition.${condition}`);
}

export function decadeName(locale: Locale, decade: number): string {
  return t(locale, "decade.label", { decade });
}

export function hearOnShelf(locale: Locale, name: string): string {
  return t(locale, "thread.hearOnShelf", { name });
}

export function hearDecadeOnShelf(locale: Locale, name: string): string {
  return t(locale, "thread.hearDecadeOnShelf", { name });
}

export function coverAlt(locale: Locale, title: string, artist: string): string {
  return t(locale, "common.coverAlt", { title, artist });
}
