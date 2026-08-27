export const SHELF_KIN_LIMIT = 4;

export function shelfKinHeadline(
  kind: "artist" | "decade",
  name: string,
  count: number,
  isOnShelf = true,
): string | null {
  const who = name.trim();

  if (count < 1 || who.length === 0) {
    return null;
  }

  if (!isOnShelf) {
    if (kind === "decade") {
      return count === 1
        ? `The ${who} already live on your shelf.`
        : `${count} from the ${who} already live on your shelf.`;
    }

    return count === 1
      ? `${who} already lives on your shelf.`
      : `${count} from ${who} already live on your shelf.`;
  }

  const more = count === 1 ? "1 more" : `${count} more`;

  if (kind === "decade") {
    return `${more} from the ${who} on your shelf.`;
  }

  return `${more} from ${who} on your shelf.`;
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
}): { headline: string; href: string; records: T[] } | null {
  const isOnShelf = input.isOnShelf ?? true;
  const fromArtist = otherPressings(input.artistRecords, input.currentId);
  const artistLine = shelfKinHeadline("artist", input.artist, fromArtist.length, isOnShelf);

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
  const decadeLine = shelfKinHeadline("decade", input.decadeLabel, fromDecade.length, isOnShelf);

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
