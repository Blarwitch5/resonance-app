import {
  portraitKindFromBytes,
  PORTRAIT_CONTENT_TYPE,
  type PortraitKind,
} from "@/lib/profile/portrait";

export const COVER_EDGE = 600;
export const COVER_EDGES = [600, 480, 360] as const;
export const MAX_COVER_UPLOAD_BYTES = 2.5 * 1024 * 1024;
export const MAX_COVER_STORED_BYTES = 80 * 1024;

export const COVER_TOO_LARGE = "This cover is too large to keep.";
export const COVER_WRONG_KIND = "Choose a JPEG, PNG, or WebP sleeve.";
export const COVER_COULD_NOT_KEEP = "This cover could not be kept just now.";

export type CoverRead =
  | { status: "empty" }
  | { status: "invalid"; message: string }
  | { status: "ready"; bytes: Uint8Array; kind: PortraitKind; contentType: string };

export async function readCoverUpload(file: File | null): Promise<CoverRead> {
  if (!file || file.size === 0) {
    return { status: "empty" };
  }

  if (file.size > MAX_COVER_UPLOAD_BYTES) {
    return { status: "invalid", message: COVER_TOO_LARGE };
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const kind = portraitKindFromBytes(bytes);

  if (!kind) {
    return { status: "invalid", message: COVER_WRONG_KIND };
  }

  return { status: "ready", bytes, kind, contentType: PORTRAIT_CONTENT_TYPE[kind] };
}

export function coverBlobPath(userId: string): string | undefined {
  const safe = userId.replace(/[^A-Za-z0-9_-]/g, "");

  if (safe.length === 0) {
    return undefined;
  }

  return `covers/${safe}.webp`;
}
