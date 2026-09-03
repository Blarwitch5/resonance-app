import type { CollectionInsight } from "@/lib/collection/stats";
import type { ReleaseDraft } from "@/lib/collection/types";
import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export const ECHO_LIMIT = 8;

export interface EchoSeed {
  kind: "artist" | "genre";
  query: string;
  name: string;
}

export function echoSeedFromInsight(insight: CollectionInsight): EchoSeed | null {
  if (insight.total === 0) {
    return null;
  }

  const artist = insight.mostPresentArtist;

  if (artist && artist.count >= 2) {
    return { kind: "artist", query: artist.name, name: artist.name };
  }

  const genre = insight.topGenres[0];

  if (genre) {
    return { kind: "genre", query: genre.name, name: genre.name };
  }

  if (artist) {
    return { kind: "artist", query: artist.name, name: artist.name };
  }

  return null;
}

export function echoHeadline(seed: EchoSeed, found: number, locale: Locale = "en"): string {
  const count = found === 1 ? t(locale, "explorer.echoAlbumOne") : t(locale, "explorer.echoAlbums", { count: found });

  if (seed.kind === "artist") {
    return t(locale, "explorer.echoArtist", { count, name: seed.name });
  }

  return t(locale, "explorer.echoGenre", { count, name: seed.name });
}

export function echoDiscoveries(drafts: ReleaseDraft[], ownedIds: Set<number>): ReleaseDraft[] {
  return drafts
    .filter((draft) => draft.discogsId !== null && !ownedIds.has(draft.discogsId))
    .slice(0, ECHO_LIMIT);
}
