import type { MediaFormat } from "@/lib/collection/types";

export function shouldShowAddPressing(pathname: string, isSignedIn: boolean): boolean {
  if (!isSignedIn) {
    return false;
  }

  return pathname === "/collection" || pathname === "/explorer";
}

export function addPressingFormatGlyph(format: MediaFormat | null | undefined): MediaFormat | null {
  if (format === "vinyl" || format === "cassette" || format === "cd") {
    return format;
  }

  return null;
}
