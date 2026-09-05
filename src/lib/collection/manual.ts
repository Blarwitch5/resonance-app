import type { MediaFormat, ReleaseDraft } from "@/lib/collection/types";
import { normalizeBarcode } from "@/lib/discogs/barcode";
import { ValidationError } from "@/lib/errors";

export const PRESSING_NAME_MAX = 200;
export const PRESSING_LABEL_MAX = 120;
export const PRESSING_BARCODE_MAX = 64;
export const PRESSING_YEAR_MIN = 1880;
export const PRESSING_YEAR_MAX = 2100;

interface ManualReleaseInput {
  artist: string;
  title: string;
  format: MediaFormat;
  year?: string | null;
  label?: string | null;
  barcode?: string | null;
}

export function toManualReleaseDraft(input: ManualReleaseInput): ReleaseDraft {
  const artist = input.artist.trim();
  const title = input.title.trim();

  if (artist.length === 0 || title.length === 0 || artist.length > PRESSING_NAME_MAX || title.length > PRESSING_NAME_MAX) {
    throw new ValidationError("An artist and a title stay between 1 and 200 characters.");
  }

  return {
    discogsId: null,
    format: input.format,
    title,
    artist,
    year: parseOptionalYear(input.year),
    label: parseOptionalLabel(input.label),
    genres: [],
    coverUrl: null,
    barcode: parseOptionalBarcode(input.barcode),
    catalogNumber: null,
  };
}

function parseOptionalYear(value: string | null | undefined): number | null {
  const raw = value?.trim() ?? "";

  if (raw.length === 0) {
    return null;
  }

  const year = Number.parseInt(raw, 10);

  if (!Number.isInteger(year) || year < PRESSING_YEAR_MIN || year > PRESSING_YEAR_MAX) {
    throw new ValidationError("That year could not be kept.");
  }

  return year;
}

function parseOptionalLabel(value: string | null | undefined): string | null {
  const label = value?.trim() ?? "";

  if (label.length === 0) {
    return null;
  }

  if (label.length > PRESSING_LABEL_MAX) {
    throw new ValidationError("That label could not be kept.");
  }

  return label;
}

function parseOptionalBarcode(value: string | null | undefined): string | null {
  const raw = value?.trim() ?? "";

  if (raw.length === 0) {
    return null;
  }

  if (raw.length > PRESSING_BARCODE_MAX) {
    throw new ValidationError("That barcode could not be kept.");
  }

  const digits = normalizeBarcode(raw);
  return digits.length > 0 ? digits : null;
}
