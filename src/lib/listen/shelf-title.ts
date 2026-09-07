import type { CollectionQuery } from "@/lib/collection/types";
import { conditionLabel, decadeName, formatLabel } from "@/lib/i18n/labels";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

/** Public headline for a shared shelf snapshot (filters only — no private notes). */
export function sharedShelfHeadline(listen: CollectionQuery, locale: Locale): string {
  const thread: string[] = [];

  if (listen.format) {
    thread.push(formatLabel(locale, listen.format));
  }

  if (listen.artist) {
    thread.push(listen.artist);
  }

  if (listen.label) {
    thread.push(listen.label);
  }

  if (listen.found) {
    thread.push(t(locale, "collection.foundIn", { place: listen.found }));
  }

  if (listen.when !== undefined) {
    thread.push(listen.found ? String(listen.when) : t(locale, "collection.foundIn", { place: listen.when }));
  }

  if (listen.arrived !== undefined) {
    thread.push(t(locale, "collection.arrivedIn", { year: listen.arrived }));
  }

  if (listen.condition) {
    thread.push(conditionLabel(locale, listen.condition).toLowerCase());
  }

  if (listen.genre) {
    thread.push(listen.genre);
  }

  if (listen.decade !== undefined) {
    thread.push(t(locale, "collection.theDecade", { decade: decadeName(locale, listen.decade) }));
  }

  if (listen.year !== undefined) {
    thread.push(String(listen.year));
  }

  if (listen.query) {
    thread.push(listen.query);
  }

  if (thread.length > 0) {
    const line = thread.join(" · ");
    return listen.keptClose
      ? t(locale, "collection.keptCloseLine", { line })
      : t(locale, "collection.shelfLine", { line });
  }

  return listen.keptClose ? t(locale, "collection.keptClosest") : t(locale, "listen.shelfWhole");
}
