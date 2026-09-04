export const PORTRAIT_EDGE = 192;
export const MAX_PORTRAIT_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_PORTRAIT_STORED_BYTES = 40 * 1024;

export const PORTRAIT_TOO_LARGE = "This portrait is too large to keep.";
export const PORTRAIT_WRONG_KIND = "Choose a JPEG, PNG, or WebP still.";
export const PORTRAIT_COULD_NOT_KEEP = "This portrait could not be kept just now.";

export const PORTRAIT_CONTENT_TYPE = {
  jpg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
} as const;

export type PortraitKind = keyof typeof PORTRAIT_CONTENT_TYPE;

export type PortraitRead =
  | { status: "empty" }
  | { status: "invalid"; message: string }
  | { status: "ready"; bytes: Uint8Array; kind: PortraitKind; contentType: string };

export function portraitKindFromBytes(bytes: Uint8Array): PortraitKind | undefined {
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "jpg";
  }

  if (
    bytes.length >= 8 &&
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a
  ) {
    return "png";
  }

  if (
    bytes.length >= 12 &&
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50
  ) {
    return "webp";
  }

  return undefined;
}

export async function readPortraitUpload(file: File | null): Promise<PortraitRead> {
  if (!file || file.size === 0) {
    return { status: "empty" };
  }

  if (file.size > MAX_PORTRAIT_UPLOAD_BYTES) {
    return { status: "invalid", message: PORTRAIT_TOO_LARGE };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = portraitKindFromBytes(bytes);

  if (!kind) {
    return { status: "invalid", message: PORTRAIT_WRONG_KIND };
  }

  return { status: "ready", bytes, kind, contentType: PORTRAIT_CONTENT_TYPE[kind] };
}

export function isResonancePortraitBlob(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" && parsed.hostname.endsWith(".blob.vercel-storage.com");
  } catch {
    return false;
  }
}

export function portraitBlobPath(userId: string): string | undefined {
  const safe = userId.replace(/[^A-Za-z0-9_-]/g, "");

  if (safe.length === 0) {
    return undefined;
  }

  return `portraits/${safe}.webp`;
}
