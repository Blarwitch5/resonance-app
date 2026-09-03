import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export const SHELF_KIN_LIMIT = 4;

export function shelfKinHeadline(
  kind: "artist" | "decade",
  name: string,
  count: number,
  isOnShelf = true,
  locale: Locale = "en",
): string | null {
  const who = name.trim();

  if (count < 1 || who.length === 0) {
    return null;
  }

  if (!isOnShelf) {
    if (kind === "decade") {
      return count === 1
        ? t(locale, "stats.kinDecadeOne", { name: who })
        : t(locale, "stats.kinDecadeMany", { count, name: who });
    }

    return count === 1
      ? t(locale, "stats.kinArtistOne", { name: who })
      : t(locale, "stats.kinArtistMany", { count, name: who });
  }

  const more = count === 1 ? t(locale, "stats.moreOne") : t(locale, "stats.moreMany", { count });

  if (kind === "decade") {
    return t(locale, "stats.kinMoreDecade", { more, name: who });
  }

  return t(locale, "stats.kinMoreArtist", { more, name: who });
}

export function pickShelfKin<T extends { id: string }>(input: {
  currentId: string;
  artist: string;
  artistHref: string;
  artistRecords: readonly T[];
  decadeLabel: string | null;
  decadeHref: string | null;
  decadeRecords: readonly T[];
  isOnShelf?: boolean;
  locale?: Locale;
}): { headline: string; href: string; records: T[] } | null {
  const isOnShelf = input.isOnShelf ?? true;
  const locale = input.locale ?? "en";
  const fromArtist = otherPressings(input.artistRecords, input.currentId);
  const artistLine = shelfKinHeadline("artist", input.artist, fromArtist.length, isOnShelf, locale);

  if (artistLine) {
    return {
      headline: artistLine,
      href: input.artistHref,
      records: fromArtist,
    };
  }

  if (!input.decadeLabel || !input.decadeHref) {
    return null;
  }

  const fromDecade = otherPressings(input.decadeRecords, input.currentId);
  const decadeLine = shelfKinHeadline("decade", input.decadeLabel, fromDecade.length, isOnShelf, locale);

  if (!decadeLine) {
    return null;
  }

  return {
    headline: decadeLine,
    href: input.decadeHref,
    records: fromDecade,
  };
}

function otherPressings<T extends { id: string }>(records: readonly T[], currentId: string): T[] {
  return records.filter((record) => record.id !== currentId).slice(0, SHELF_KIN_LIMIT);
}
