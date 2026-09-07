import { randomBytes } from "node:crypto";

const TOKEN_BYTES = 16;

export function createShareToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function isShareToken(value: string): boolean {
  return /^[A-Za-z0-9_-]{20,32}$/.test(value);
}

/** First path segment only — share sheets sometimes append title/text into the URL. */
export function parseShareTokenParam(raw: string): string | null {
  let decoded = raw;

  try {
    decoded = decodeURIComponent(raw);
  } catch {
    decoded = raw;
  }

  const candidate = decoded.trim().split(/[\s/?#]/)[0] ?? "";
  return isShareToken(candidate) ? candidate : null;
}
