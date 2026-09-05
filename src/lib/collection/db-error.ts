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

const OPTIONAL_INSERT_COLUMNS = {
  cover_thumb_url: "coverThumbUrl",
  catalog_number: "catalogNumber",
} as const;

export type OptionalInsertField = (typeof OPTIONAL_INSERT_COLUMNS)[keyof typeof OPTIONAL_INSERT_COLUMNS];

export function missingOptionalInsertField(error: unknown): OptionalInsertField | null {
  for (const current of walkCauses(error)) {
    const code =
      typeof current === "object" && current !== null && "code" in current && typeof current.code === "string"
        ? current.code
        : undefined;
    const message = current instanceof Error ? current.message : "";
    const column =
      /column ["']([^"']+)["']/.exec(message)?.[1] ??
      /column ([a-z_]+) does not exist/i.exec(message)?.[1];

    if (!column || !(column in OPTIONAL_INSERT_COLUMNS)) {
      continue;
    }

    if (code === "42703" || /does not exist/i.test(message)) {
      return OPTIONAL_INSERT_COLUMNS[column as keyof typeof OPTIONAL_INSERT_COLUMNS];
    }
  }

  return null;
}

export function isMissingCoverThumbColumn(error: unknown): boolean {
  return missingOptionalInsertField(error) === "coverThumbUrl";
}
