import "server-only";

import { and, eq } from "drizzle-orm";

import { getDb } from "@/db";
import { collectionItem, sharedPressing, sharedShelf, user } from "@/db/schema";
import { isUniqueViolation } from "@/lib/collection/db-error";
import { listCollectionItems } from "@/lib/collection/repository";
import type { CollectionQuery } from "@/lib/collection/types";
import { DatabaseError, NotFoundError } from "@/lib/errors";
import { sharedShelfHeadline } from "@/lib/listen/shelf-title";
import { createShareToken } from "@/lib/listen/token";
import {
  SHARE_SHELF_MAX,
  type SharedPressingSnapshot,
  type SharedShelfItem,
  type SharedShelfSnapshot,
} from "@/lib/listen/types";
import type { Locale } from "@/lib/settings/types";

export async function createOrGetSharedPressing(
  userId: string,
  itemId: string,
): Promise<{ token: string }> {
  try {
    const existing = await getDb()
      .select({ token: sharedPressing.token })
      .from(sharedPressing)
      .where(and(eq(sharedPressing.userId, userId), eq(sharedPressing.collectionItemId, itemId)))
      .limit(1);

    const known = existing[0];

    if (known) {
      return { token: known.token };
    }

    const [item] = await getDb()
      .select({
        id: collectionItem.id,
        discogsId: collectionItem.discogsId,
        format: collectionItem.format,
        title: collectionItem.title,
        artist: collectionItem.artist,
        year: collectionItem.year,
        label: collectionItem.label,
        genres: collectionItem.genres,
        coverUrl: collectionItem.coverUrl,
        coverThumbUrl: collectionItem.coverThumbUrl,
      })
      .from(collectionItem)
      .where(and(eq(collectionItem.id, itemId), eq(collectionItem.userId, userId)))
      .limit(1);

    if (!item) {
      throw new NotFoundError("This pressing could not be found.");
    }

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = createShareToken();

      try {
        await getDb().insert(sharedPressing).values({
          token,
          userId,
          collectionItemId: item.id,
          discogsId: item.discogsId,
          format: item.format,
          title: item.title,
          artist: item.artist,
          year: item.year,
          label: item.label,
          genres: item.genres,
          coverUrl: item.coverUrl,
          coverThumbUrl: item.coverThumbUrl,
        });

        return { token };
      } catch (error) {
        if (isUniqueViolation(error)) {
          const raced = await getDb()
            .select({ token: sharedPressing.token })
            .from(sharedPressing)
            .where(and(eq(sharedPressing.userId, userId), eq(sharedPressing.collectionItemId, itemId)))
            .limit(1);

          if (raced[0]) {
            return { token: raced[0].token };
          }

          continue;
        }

        throw error;
      }
    }

    throw new DatabaseError("This pressing could not travel just now.");
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError("This pressing could not travel just now.", { cause: error });
  }
}

export async function getSharedPressingByToken(token: string): Promise<SharedPressingSnapshot | null> {
  try {
    const [row] = await getDb()
      .select({
        token: sharedPressing.token,
        discogsId: sharedPressing.discogsId,
        format: sharedPressing.format,
        title: sharedPressing.title,
        artist: sharedPressing.artist,
        year: sharedPressing.year,
        label: sharedPressing.label,
        genres: sharedPressing.genres,
        coverUrl: sharedPressing.coverUrl,
        coverThumbUrl: sharedPressing.coverThumbUrl,
        sharerName: user.name,
      })
      .from(sharedPressing)
      .innerJoin(user, eq(user.id, sharedPressing.userId))
      .where(eq(sharedPressing.token, token))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      token: row.token,
      discogsId: row.discogsId,
      format: row.format,
      title: row.title,
      artist: row.artist,
      year: row.year,
      label: row.label,
      genres: row.genres,
      coverUrl: row.coverUrl,
      coverThumbUrl: row.coverThumbUrl,
      sharerName: row.sharerName,
    };
  } catch (error) {
    throw new DatabaseError("This pressing could not be heard.", { cause: error });
  }
}

export async function deleteSharedPressingForItem(userId: string, itemId: string): Promise<void> {
  try {
    await getDb()
      .delete(sharedPressing)
      .where(and(eq(sharedPressing.userId, userId), eq(sharedPressing.collectionItemId, itemId)));
  } catch (error) {
    throw new DatabaseError("This link could not be quieted.", { cause: error });
  }
}

export async function getSharedPressingTokenForItem(
  userId: string,
  itemId: string,
): Promise<string | null> {
  try {
    const [row] = await getDb()
      .select({ token: sharedPressing.token })
      .from(sharedPressing)
      .where(and(eq(sharedPressing.userId, userId), eq(sharedPressing.collectionItemId, itemId)))
      .limit(1);

    return row?.token ?? null;
  } catch (error) {
    throw new DatabaseError("This pressing could not be heard.", { cause: error });
  }
}

export async function deleteSharedShelf(userId: string, token: string): Promise<void> {
  try {
    await getDb()
      .delete(sharedShelf)
      .where(and(eq(sharedShelf.userId, userId), eq(sharedShelf.token, token)));
  } catch (error) {
    throw new DatabaseError("This link could not be quieted.", { cause: error });
  }
}

export async function createSharedShelf(
  userId: string,
  listen: CollectionQuery,
  locale: Locale,
): Promise<{ token: string }> {
  try {
    const rows = await listCollectionItems(userId, {
      kind: "owned",
      ...listen,
      page: 1,
      pageSize: SHARE_SHELF_MAX + 1,
    });
    const truncated = rows.length > SHARE_SHELF_MAX;
    const items: SharedShelfItem[] = rows.slice(0, SHARE_SHELF_MAX).map((row) => ({
      discogsId: row.discogsId,
      format: row.format,
      title: row.title,
      artist: row.artist,
      year: row.year,
      label: row.label,
      genres: row.genres,
      coverUrl: row.coverUrl,
      coverThumbUrl: row.coverThumbUrl,
    }));

    if (items.length === 0) {
      throw new NotFoundError("This shelf has nothing to share yet.");
    }

    const headline = sharedShelfHeadline(listen, locale);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = createShareToken();

      try {
        await getDb().insert(sharedShelf).values({
          token,
          userId,
          headline,
          items,
          truncated,
        });

        return { token };
      } catch (error) {
        if (isUniqueViolation(error)) {
          continue;
        }

        throw error;
      }
    }

    throw new DatabaseError("This shelf could not travel just now.");
  } catch (error) {
    if (error instanceof NotFoundError || error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError("This shelf could not travel just now.", { cause: error });
  }
}

export async function getSharedShelfByToken(token: string): Promise<SharedShelfSnapshot | null> {
  try {
    const [row] = await getDb()
      .select({
        token: sharedShelf.token,
        headline: sharedShelf.headline,
        items: sharedShelf.items,
        truncated: sharedShelf.truncated,
        sharerName: user.name,
      })
      .from(sharedShelf)
      .innerJoin(user, eq(user.id, sharedShelf.userId))
      .where(eq(sharedShelf.token, token))
      .limit(1);

    if (!row) {
      return null;
    }

    return {
      token: row.token,
      headline: row.headline,
      items: row.items,
      truncated: row.truncated,
      sharerName: row.sharerName,
    };
  } catch (error) {
    throw new DatabaseError("This shelf could not be heard.", { cause: error });
  }
}
