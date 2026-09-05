import "server-only";

import { and, asc, count, desc, eq, gt, gte, ilike, inArray, lt, ne, or, sql, type SQL } from "drizzle-orm";

import { getDb } from "@/db";
import { collectionItem } from "@/db/schema";
import { backupRecordKey, freshBackupRecords, type ResonanceBackupRecord } from "@/lib/collection/backup";
import type { ShelfCopy } from "@/lib/collection/confirm";
import {
  isUniqueViolation,
  missingOptionalInsertField,
  postgresCode,
  postgresDetail,
  type OptionalInsertField,
} from "@/lib/collection/db-error";
import { createCollectionItem } from "@/lib/collection/factory";
import type { CollectionStatItem } from "@/lib/collection/stats";
import type {
  CollectionKind,
  CollectionSort,
  MediaCondition,
  MediaFormat,
  ReleaseDraft,
  ShelfNeighbor,
  ShelfPresence,
} from "@/lib/collection/types";
import { isBarcodeQuery, normalizeBarcode } from "@/lib/discogs/barcode";
import { DatabaseError, NotFoundError, ValidationError } from "@/lib/errors";

interface ListFilters {
  format?: MediaFormat;
  kind?: CollectionKind;
  query?: string;
  sort?: CollectionSort;
  page?: number;
  pageSize?: number;
  keptClose?: boolean;
  artist?: string;
  genre?: string;
  decade?: number;
  label?: string;
  found?: string;
  condition?: MediaCondition;
  when?: number;
  arrived?: number;
  year?: number;
}

export const SHELF_PAGE_SIZE = 48;

const collectionItemColumns = {
  id: collectionItem.id,
  userId: collectionItem.userId,
  discogsId: collectionItem.discogsId,
  format: collectionItem.format,
  title: collectionItem.title,
  artist: collectionItem.artist,
  year: collectionItem.year,
  label: collectionItem.label,
  genres: collectionItem.genres,
  coverUrl: collectionItem.coverUrl,
  coverThumbUrl: collectionItem.coverThumbUrl,
  barcode: collectionItem.barcode,
  catalogNumber: collectionItem.catalogNumber,
  condition: collectionItem.condition,
  purchaseLocation: collectionItem.purchaseLocation,
  purchaseDate: collectionItem.purchaseDate,
  notes: collectionItem.notes,
  isFavorite: collectionItem.isFavorite,
  isWishlist: collectionItem.isWishlist,
  createdAt: collectionItem.createdAt,
  updatedAt: collectionItem.updatedAt,
};

const SELECT_FALLBACKS: Partial<Record<OptionalInsertField, unknown>> = {
  discogsId: sql<number | null>`cast(null as integer)`.as("discogs_id"),
  format: sql<typeof collectionItem.format>`cast('vinyl' as media_format)`.as("format"),
  year: sql<number | null>`cast(null as integer)`.as("year"),
  label: sql<string | null>`cast(null as text)`.as("label"),
  genres: sql<string[]>`cast('{}' as text[])`.as("genres"),
  coverUrl: sql<string | null>`cast(null as text)`.as("cover_url"),
  coverThumbUrl: sql<string | null>`cast(null as text)`.as("cover_thumb_url"),
  barcode: sql<string | null>`cast(null as text)`.as("barcode"),
  catalogNumber: sql<string | null>`cast(null as text)`.as("catalog_number"),
  condition: sql<string | null>`cast(null as text)`.as("condition"),
  purchaseLocation: sql<string | null>`cast(null as text)`.as("purchase_location"),
  purchaseDate: sql<Date | null>`cast(null as timestamp)`.as("purchase_date"),
  notes: sql<string | null>`cast(null as text)`.as("notes"),
  isFavorite: sql<boolean>`false`.as("is_favorite"),
  isWishlist: sql<boolean>`false`.as("is_wishlist"),
};

function collectionSelectColumns(missing: ReadonlySet<OptionalInsertField>) {
  const columns = { ...collectionItemColumns };

  for (const field of missing) {
    const fallback = SELECT_FALLBACKS[field];

    if (fallback) {
      Object.assign(columns, { [field]: fallback });
    }
  }

  return columns;
}

const collectionItemWithThumb = collectionSelectColumns(new Set());
const collectionItemWithoutThumb = collectionSelectColumns(new Set(["coverThumbUrl"]));

async function selectCollectionRows<T>(
  run: (columns: ReturnType<typeof collectionSelectColumns>) => Promise<T>,
): Promise<T> {
  const missing = new Set<OptionalInsertField>();

  for (let attempt = 0; attempt < 16; attempt += 1) {
    try {
      return await run(collectionSelectColumns(missing));
    } catch (error) {
      const field = missingOptionalInsertField(error);

      if (!field || missing.has(field)) {
        throw error;
      }

      missing.add(field);
    }
  }

  throw new DatabaseError("Your collection could not be loaded.");
}

type CollectionInsert = typeof collectionItem.$inferInsert;

function omitField<T extends object>(value: T, field: string): T {
  const next = { ...value };
  delete (next as Record<string, unknown>)[field];
  return next;
}

async function insertCollectionRows(
  values: CollectionInsert[],
  returning: typeof collectionItemWithThumb | { id: typeof collectionItem.id } = collectionItemWithThumb,
  ignoreConflict = false,
) {
  let rows = values;

  for (let attempt = 0; attempt < 16; attempt += 1) {
    try {
      const query = getDb().insert(collectionItem).values(rows);
      const next = ignoreConflict ? query.onConflictDoNothing() : query;
      return await next.returning(
        returning === collectionItemWithThumb && rows.every((row) => !("coverThumbUrl" in row))
          ? collectionItemWithoutThumb
          : returning,
      );
    } catch (error) {
      const field = missingOptionalInsertField(error);

      if (!field) {
        throw error;
      }

      rows = rows.map((row) => omitField(row, field));
    }
  }

  throw new DatabaseError("The record could not be added to your collection.");
}

type CollectionPatch = {
  notes?: string | null;
  condition?: MediaCondition | null;
  isFavorite?: boolean;
  isWishlist?: boolean;
  purchaseLocation?: string | null;
  purchaseDate?: Date | null;
  catalogNumber?: string | null;
  coverThumbUrl?: string | null;
  coverUrl?: string | null;
  barcode?: string | null;
  discogsId?: number | null;
  year?: number | null;
  label?: string | null;
  genres?: string[];
  format?: MediaFormat;
};

async function updateCollectionRow(userId: string, id: string, patch: CollectionPatch) {
  let nextPatch: CollectionPatch = patch;
  const missing = new Set<OptionalInsertField>();

  for (let attempt = 0; attempt < 16; attempt += 1) {
    try {
      return await getDb()
        .update(collectionItem)
        .set({
          ...nextPatch,
          updatedAt: new Date(),
        })
        .where(and(eq(collectionItem.id, id), eq(collectionItem.userId, userId)))
        .returning(collectionSelectColumns(missing));
    } catch (error) {
      const field = missingOptionalInsertField(error);

      if (!field || missing.has(field)) {
        throw error;
      }

      missing.add(field);
      nextPatch = omitField(nextPatch, field);
    }
  }

  throw new DatabaseError("This record could not be updated.");
}

function collectionWhere(userId: string, filters: ListFilters): SQL[] {
  const conditions: SQL[] = [eq(collectionItem.userId, userId)];

  if (filters.format) {
    conditions.push(eq(collectionItem.format, filters.format));
  }

  if (filters.kind === "favorite") {
    conditions.push(eq(collectionItem.isFavorite, true));
  }

  if (filters.kind === "wishlist") {
    conditions.push(eq(collectionItem.isWishlist, true));
  }

  if (filters.kind === "owned") {
    conditions.push(eq(collectionItem.isWishlist, false));
  }

  if (filters.keptClose) {
    conditions.push(eq(collectionItem.isFavorite, true));
  }

  if (filters.artist) {
    conditions.push(eq(collectionItem.artist, filters.artist));
  }

  if (filters.label) {
    conditions.push(eq(collectionItem.label, filters.label));
  }

  if (filters.found) {
    conditions.push(eq(collectionItem.purchaseLocation, filters.found));
  }

  if (filters.when !== undefined) {
    conditions.push(sql`extract(year from ${collectionItem.purchaseDate}) = ${filters.when}`);
  }

  if (filters.arrived !== undefined) {
    conditions.push(sql`extract(year from ${collectionItem.createdAt}) = ${filters.arrived}`);
  }

  if (filters.condition) {
    conditions.push(eq(collectionItem.condition, filters.condition));
  }

  if (filters.genre) {
    conditions.push(sql`${filters.genre} = ANY(${collectionItem.genres})`);
  }

  if (filters.decade !== undefined) {
    const decadeRange = and(
      gte(collectionItem.year, filters.decade),
      lt(collectionItem.year, filters.decade + 10),
    );

    if (decadeRange) {
      conditions.push(decadeRange);
    }
  }

  if (filters.year !== undefined) {
    conditions.push(eq(collectionItem.year, filters.year));
  }

  const query = filters.query?.trim();

  if (query && query.length > 0) {
    if (isBarcodeQuery(query)) {
      const digits = normalizeBarcode(query);
      conditions.push(
        sql`regexp_replace(coalesce(${collectionItem.barcode}, ''), '[^0-9]', '', 'g') = ${digits}`,
      );
    } else {
      const pattern = `%${escapeIlike(query)}%`;
      const match = or(
        ilike(collectionItem.title, pattern),
        ilike(collectionItem.artist, pattern),
        ilike(collectionItem.label, pattern),
        ilike(collectionItem.barcode, pattern),
        ilike(collectionItem.notes, pattern),
        ilike(collectionItem.purchaseLocation, pattern),
      );

      if (match) {
        conditions.push(match);
      }
    }
  }

  return conditions;
}

export async function listCollectionItems(userId: string, filters: ListFilters = {}) {
  try {
    const conditions = collectionWhere(userId, filters);
    const order =
      filters.sort === "artist"
        ? [asc(collectionItem.artist), asc(collectionItem.title)]
        : filters.sort === "year"
          ? [sql`${collectionItem.year} desc nulls last`, asc(collectionItem.title)]
          : filters.sort === "found"
            ? [sql`${collectionItem.purchaseDate} desc nulls last`, desc(collectionItem.createdAt)]
            : [desc(collectionItem.createdAt)];

    const pageSize = filters.pageSize;
    const page = filters.page && filters.page > 0 ? filters.page : 1;
    return await selectCollectionRows(async (columns) => {
      const listing = getDb()
        .select(columns)
        .from(collectionItem)
        .where(and(...conditions))
        .orderBy(...order);

      if (pageSize && pageSize > 0) {
        return listing.limit(pageSize).offset((page - 1) * pageSize);
      }

      return listing;
    });
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function countCollectionItems(userId: string, filters: ListFilters = {}): Promise<number> {
  try {
    const conditions = collectionWhere(userId, filters);
    const [row] = await getDb()
      .select({ total: count() })
      .from(collectionItem)
      .where(and(...conditions));

    return Number(row?.total ?? 0);
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function listTonightRecords(userId: string) {
  try {
    return await getDb()
      .select({
        id: collectionItem.id,
        isFavorite: collectionItem.isFavorite,
      })
      .from(collectionItem)
      .where(and(...collectionWhere(userId, { kind: "owned" })));
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function listPaletteRecords(userId: string, limit: number) {
  try {
    return await getDb()
      .select({
        id: collectionItem.id,
        artist: collectionItem.artist,
        title: collectionItem.title,
      })
      .from(collectionItem)
      .where(and(...collectionWhere(userId, { kind: "owned" })))
      .orderBy(desc(collectionItem.createdAt))
      .limit(limit);
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function listCollectionStatItems(userId: string): Promise<CollectionStatItem[]> {
  try {
    return await getDb()
      .select({
        format: collectionItem.format,
        artist: collectionItem.artist,
        year: collectionItem.year,
        label: collectionItem.label,
        purchaseLocation: collectionItem.purchaseLocation,
        purchaseDate: collectionItem.purchaseDate,
        createdAt: collectionItem.createdAt,
        genres: collectionItem.genres,
      })
      .from(collectionItem)
      .where(and(...collectionWhere(userId, { kind: "owned" })));
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function addCollectionItem(
  userId: string,
  draft: ReleaseDraft,
  kind: CollectionKind = "owned",
  notes?: string | null,
) {
  const item = createCollectionItem({ draft, kind, notes });
  const core: CollectionInsert = {
    userId,
    discogsId: item.discogsId,
    title: item.title,
    artist: item.artist,
    format: item.format,
    isFavorite: item.isFavorite,
    isWishlist: item.isWishlist,
  };
  const extras: CollectionPatch = {
    year: item.year,
    label: item.label,
    genres: item.genres,
    coverUrl: item.coverUrl,
    coverThumbUrl: item.coverThumbUrl,
    barcode: item.barcode,
    catalogNumber: item.catalogNumber,
    notes: item.notes,
  };

  try {
    if (item.discogsId !== null) {
      let copies: ShelfCopy[] = [];

      try {
        copies = await listShelfCopies(userId, item.discogsId);
      } catch {
        copies = [];
      }

      const sameFormat = copies.find((copy) => copy.format === item.format);

      if (sameFormat) {
        return { id: sameFormat.id };
      }
    }

    const [created] = await insertCollectionRows([core], { id: collectionItem.id });

    if (!created) {
      throw new DatabaseError("The record could not be added to your collection.");
    }

    try {
      await updateCollectionRow(userId, created.id, extras);
    } catch {
      // Later columns are optional; the pressing is already on the shelf.
    }

    return created;
  } catch (error) {
    if (error instanceof DatabaseError || error instanceof ValidationError) {
      throw error;
    }

    if (isUniqueViolation(error) && item.discogsId !== null) {
      try {
        const existing = (await listShelfCopies(userId, item.discogsId)).find(
          (copy) => copy.format === item.format,
        );

        if (existing) {
          return { id: existing.id };
        }
      } catch {
        // The unique conflict is enough to stop a second copy.
      }

      throw new ValidationError("This pressing is already on your shelf.");
    }

    console.error("Resonance add collection item failed", {
      code: postgresCode(error),
      detail: postgresDetail(error),
    });
    throw new DatabaseError("The record could not be added to your collection.", {
      cause: error,
    });
  }
}

function escapeIlike(value: string): string {
  return value.replaceAll("\\", "\\\\").replaceAll("%", "\\%").replaceAll("_", "\\_");
}

export async function listShelfPresence(
  userId: string,
  discogsIds: number[],
): Promise<Map<number, Exclude<ShelfPresence, { status: "absent" }>>> {
  const presence = new Map<number, Exclude<ShelfPresence, { status: "absent" }>>();

  if (discogsIds.length === 0) {
    return presence;
  }

  const uniqueIds = [...new Set(discogsIds)];

  try {
    const rows = await getDb()
      .select({
        id: collectionItem.id,
        discogsId: collectionItem.discogsId,
        isWishlist: collectionItem.isWishlist,
      })
      .from(collectionItem)
      .where(and(eq(collectionItem.userId, userId), inArray(collectionItem.discogsId, uniqueIds)));

    for (const row of rows) {
      if (row.discogsId === null) {
        continue;
      }

      const current = presence.get(row.discogsId);

      if (current?.status === "owned") {
        continue;
      }

      presence.set(row.discogsId, {
        status: row.isWishlist ? "wishlist" : "owned",
        itemId: row.id,
      });
    }

    return presence;
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function listShelfCopies(userId: string, discogsId: number): Promise<ShelfCopy[]> {
  if (!Number.isInteger(discogsId) || discogsId <= 0) {
    return [];
  }

  try {
    return await getDb()
      .select({
        id: collectionItem.id,
        format: collectionItem.format,
        isWishlist: collectionItem.isWishlist,
      })
      .from(collectionItem)
      .where(and(eq(collectionItem.userId, userId), eq(collectionItem.discogsId, discogsId)));
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function listShelfNeighbors(
  userId: string,
  itemId: string,
  isWishlist: boolean,
  createdAt: Date | string,
): Promise<{ before: ShelfNeighbor | null; after: ShelfNeighbor | null }> {
  const when = createdAt instanceof Date ? createdAt : new Date(createdAt);
  const scope = and(eq(collectionItem.userId, userId), eq(collectionItem.isWishlist, isWishlist));

  try {
    const [newer, older] = await Promise.all([
      getDb()
        .select({
          id: collectionItem.id,
          title: collectionItem.title,
        })
        .from(collectionItem)
        .where(and(scope, ne(collectionItem.id, itemId), gt(collectionItem.createdAt, when)))
        .orderBy(asc(collectionItem.createdAt))
        .limit(1),
      getDb()
        .select({
          id: collectionItem.id,
          title: collectionItem.title,
        })
        .from(collectionItem)
        .where(and(scope, ne(collectionItem.id, itemId), lt(collectionItem.createdAt, when)))
        .orderBy(desc(collectionItem.createdAt))
        .limit(1),
    ]);

    return {
      before: newer[0] ?? null,
      after: older[0] ?? null,
    };
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function getCollectionItem(userId: string, id: string) {
  try {
    const [item] = await selectCollectionRows((columns) =>
      getDb()
        .select(columns)
        .from(collectionItem)
        .where(and(eq(collectionItem.id, id), eq(collectionItem.userId, userId)))
        .limit(1),
    );

    if (!item) {
      throw new NotFoundError("This record is not in your collection.");
    }

    return item;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DatabaseError("This record could not be opened.", { cause: error });
  }
}

export async function hasShelfItems(userId: string): Promise<boolean> {
  try {
    const [row] = await getDb()
      .select({ id: collectionItem.id })
      .from(collectionItem)
      .where(eq(collectionItem.userId, userId))
      .limit(1);

    return Boolean(row);
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function updateCollectionItem(
  userId: string,
  id: string,
  patch: {
    notes?: string | null;
    condition?: MediaCondition | null;
    isFavorite?: boolean;
    isWishlist?: boolean;
    purchaseLocation?: string | null;
    purchaseDate?: Date | null;
    catalogNumber?: string | null;
    coverThumbUrl?: string | null;
  },
) {
  try {
    const [updated] = await updateCollectionRow(userId, id, patch);

    if (!updated) {
      throw new NotFoundError("This record is not in your collection.");
    }

    return updated;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DatabaseError("This record could not be updated.", { cause: error });
  }
}

export async function deleteCollectionItem(userId: string, id: string) {
  try {
    const deleted = await getDb()
      .delete(collectionItem)
      .where(and(eq(collectionItem.id, id), eq(collectionItem.userId, userId)))
      .returning({ id: collectionItem.id });

    if (deleted.length === 0) {
      throw new NotFoundError("This record is not in your collection.");
    }
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }

    throw new DatabaseError("This record could not be removed.", { cause: error });
  }
}

export async function listItemKeys(userId: string): Promise<Set<string>> {
  try {
    const rows = await getDb()
      .select({
        discogsId: collectionItem.discogsId,
        format: collectionItem.format,
      })
      .from(collectionItem)
      .where(eq(collectionItem.userId, userId));

    const keys = new Set<string>();

    for (const row of rows) {
      if (row.discogsId === null) {
        continue;
      }

      keys.add(`${row.discogsId}:${row.format}`);
    }

    return keys;
  } catch (error) {
    throw new DatabaseError("Your collection could not be loaded.", { cause: error });
  }
}

export async function addCollectionItems(
  userId: string,
  entries: Array<{ draft: ReleaseDraft; kind: CollectionKind }>,
): Promise<{ added: number; skipped: number }> {
  if (entries.length === 0) {
    return { added: 0, skipped: 0 };
  }

  const existing = await listItemKeys(userId);
  const fresh = entries.filter((entry) => {
    if (entry.draft.discogsId === null) {
      return false;
    }

    return !existing.has(`${entry.draft.discogsId}:${entry.draft.format}`);
  });
  const skipped = entries.length - fresh.length;

  if (fresh.length === 0) {
    return { added: 0, skipped };
  }

  try {
    const values = fresh.map((entry) => ({
      userId,
      ...createCollectionItem({ draft: entry.draft, kind: entry.kind }),
    }));
    const inserted = await insertCollectionRows(values, { id: collectionItem.id }, true);

    return { added: inserted.length, skipped: skipped + (fresh.length - inserted.length) };
  } catch (error) {
    throw new DatabaseError("Those records could not be added to your collection.", { cause: error });
  }
}

const RESTORE_CHUNK = 200;

export async function restoreCollectionItems(
  userId: string,
  records: ResonanceBackupRecord[],
): Promise<{ added: number; skipped: number }> {
  if (records.length === 0) {
    return { added: 0, skipped: 0 };
  }

  const existing = await listCollectionItems(userId);
  const keys = new Set(existing.map((row) => backupRecordKey(row)));
  const fresh = freshBackupRecords(records, keys);
  const skipped = records.length - fresh.length;

  if (fresh.length === 0) {
    return { added: 0, skipped };
  }

  try {
    const values = fresh.map((record) => ({
      userId,
      discogsId: record.discogsId,
      format: record.format,
      title: record.title,
      artist: record.artist,
      year: record.year,
      label: record.label,
      genres: record.genres,
      coverUrl: record.coverUrl,
      coverThumbUrl: record.coverThumbUrl,
      barcode: record.barcode,
      catalogNumber: record.catalogNumber,
      condition: record.condition,
      purchaseLocation: record.purchaseLocation,
      purchaseDate: record.purchaseDate ? new Date(record.purchaseDate) : null,
      notes: record.notes,
      isFavorite: record.isFavorite,
      isWishlist: record.isWishlist,
      createdAt: new Date(record.createdAt),
    }));

    let added = 0;

    for (let index = 0; index < values.length; index += RESTORE_CHUNK) {
      const slice = values.slice(index, index + RESTORE_CHUNK);
      const inserted = await insertCollectionRows(slice, { id: collectionItem.id }, true);
      added += inserted.length;
    }

    return { added, skipped: skipped + (fresh.length - added) };
  } catch (error) {
    throw new DatabaseError("This copy could not be brought home.", { cause: error });
  }
}
