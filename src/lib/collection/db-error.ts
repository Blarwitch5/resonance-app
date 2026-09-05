function walkCauses(error: unknown): unknown[] {
  const seen: unknown[] = [];
  let current: unknown = error;

  while (current && typeof current === "object" && !seen.includes(current)) {
    seen.push(current);
    current = "cause" in current ? current.cause : undefined;
  }

  return seen;
}

export function postgresCode(error: unknown): string | undefined {
  for (const current of walkCauses(error)) {
    if (typeof current === "object" && current !== null && "code" in current && typeof current.code === "string") {
      if (/^\d{5}$/.test(current.code)) {
        return current.code;
      }
    }
  }

  return undefined;
}

export function isUniqueViolation(error: unknown): boolean {
  if (postgresCode(error) === "23505") {
    return true;
  }

  return walkCauses(error).some((current) => {
    const message = current instanceof Error ? current.message : "";
    return /duplicate key value/i.test(message);
  });
}

export function postgresDetail(error: unknown): string | undefined {
  for (const current of walkCauses(error)) {
    if (typeof current === "object" && current !== null && "detail" in current && typeof current.detail === "string") {
      return current.detail.slice(0, 180);
    }

    if (current instanceof Error && current.name === "NeonDbError") {
      return current.message.slice(0, 180);
    }
  }

  return undefined;
}

export const COLLECTION_COLUMNS = {
  discogs_id: "discogsId",
  format: "format",
  year: "year",
  label: "label",
  genres: "genres",
  cover_url: "coverUrl",
  cover_thumb_url: "coverThumbUrl",
  barcode: "barcode",
  catalog_number: "catalogNumber",
  condition: "condition",
  purchase_location: "purchaseLocation",
  purchase_date: "purchaseDate",
  notes: "notes",
  is_favorite: "isFavorite",
  is_wishlist: "isWishlist",
} as const;

export type OptionalInsertField = (typeof COLLECTION_COLUMNS)[keyof typeof COLLECTION_COLUMNS];

function sqlColumnName(message: string): string | undefined {
  return (
    /column ["']([^"']+)["']/.exec(message)?.[1] ??
    /column ([a-z_]+) does not exist/i.exec(message)?.[1] ??
    /["']([a-z_]+)["'] is of type/i.exec(message)?.[1]
  );
}

export function missingOptionalInsertField(error: unknown): OptionalInsertField | null {
  const code = postgresCode(error);
  const skippable = code === "42703" || code === "42804";

  for (const current of walkCauses(error)) {
    const message = current instanceof Error ? current.message : "";
    const column = sqlColumnName(message);

    if (!column || !(column in COLLECTION_COLUMNS)) {
      continue;
    }

    if (skippable || /does not exist/i.test(message) || /is of type/i.test(message)) {
      return COLLECTION_COLUMNS[column as keyof typeof COLLECTION_COLUMNS];
    }
  }

  return null;
}

export function isMissingCoverThumbColumn(error: unknown): boolean {
  return missingOptionalInsertField(error) === "coverThumbUrl";
}
