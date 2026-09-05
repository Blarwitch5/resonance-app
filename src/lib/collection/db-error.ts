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
  return postgresCode(error) === "23505";
}

export function isMissingCoverThumbColumn(error: unknown): boolean {
  for (const current of walkCauses(error)) {
    const code =
      typeof current === "object" && current !== null && "code" in current && typeof current.code === "string"
        ? current.code
        : undefined;
    const message = current instanceof Error ? current.message : "";

    if (code === "42703" && message.includes("cover_thumb_url")) {
      return true;
    }

    if (/column ["']cover_thumb_url["'].*does not exist/i.test(message)) {
      return true;
    }
  }

  return false;
}
