import { z } from "zod";

import { MEDIA_CONDITIONS, MEDIA_FORMATS, type MediaCondition, type MediaFormat } from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";
import { LOCALES, THEME_PREFERENCES, VIEW_MODES, type Locale, type ThemePreference, type UserSettings, type ViewMode } from "@/lib/settings/types";

export const RESONANCE_BACKUP_VERSION = 1;

export interface ResonanceBackupItem {
  id: string;
  userId: string;
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  coverThumbUrl: string | null;
  barcode: string | null;
  catalogNumber: string | null;
  condition: MediaCondition | null;
  purchaseLocation: string | null;
  purchaseDate: Date | null;
  notes: string | null;
  isFavorite: boolean;
  isWishlist: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ResonanceBackupRecord {
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
  year: number | null;
  label: string | null;
  genres: string[];
  coverUrl: string | null;
  coverThumbUrl: string | null;
  barcode: string | null;
  catalogNumber: string | null;
  condition: MediaCondition | null;
  purchaseLocation: string | null;
  purchaseDate: string | null;
  notes: string | null;
  isFavorite: boolean;
  isWishlist: boolean;
  createdAt: string;
}

export interface ResonanceBackupSettings {
  vinylEnabled: boolean;
  cassetteEnabled: boolean;
  cdEnabled: boolean;
  theme: ThemePreference;
  viewMode: ViewMode;
  defaultFormat?: MediaFormat | null;
  bio: string | null;
  locale?: Locale;
  marketValueEnabled?: boolean;
}

export interface ResonanceBackup {
  version: typeof RESONANCE_BACKUP_VERSION;
  exportedAt: string;
  settings: ResonanceBackupSettings;
  records: ResonanceBackupRecord[];
}

export function toResonanceBackup(input: {
  exportedAt: Date;
  settings: UserSettings;
  items: ResonanceBackupItem[];
}): ResonanceBackup {
  return {
    version: RESONANCE_BACKUP_VERSION,
    exportedAt: input.exportedAt.toISOString(),
    settings: {
      vinylEnabled: input.settings.vinylEnabled,
      cassetteEnabled: input.settings.cassetteEnabled,
      cdEnabled: input.settings.cdEnabled,
      theme: input.settings.theme,
      viewMode: input.settings.viewMode,
      defaultFormat: input.settings.defaultFormat,
      bio: input.settings.bio,
      locale: input.settings.locale,
      marketValueEnabled: input.settings.marketValueEnabled,
    },
    records: input.items.map((item) => ({
      discogsId: item.discogsId,
      format: item.format,
      title: item.title,
      artist: item.artist,
      year: item.year,
      label: item.label,
      genres: item.genres,
      coverUrl: item.coverUrl,
      coverThumbUrl: item.coverThumbUrl,
      barcode: item.barcode,
      catalogNumber: item.catalogNumber,
      condition: item.condition,
      purchaseLocation: item.purchaseLocation,
      purchaseDate: item.purchaseDate ? item.purchaseDate.toISOString() : null,
      notes: item.notes,
      isFavorite: item.isFavorite,
      isWishlist: item.isWishlist,
      createdAt: item.createdAt.toISOString(),
    })),
  };
}

export function backupFilename(exportedAt: Date): string {
  return `resonance-${exportedAt.toISOString().slice(0, 10)}.json`;
}

export const MAX_BACKUP_BYTES = 2_000_000;
export const MAX_BACKUP_RECORDS = 2000;

const httpsUrl = z.url().refine((value) => value.startsWith("https://"));

const backupRecordSchema = z.object({
  discogsId: z.number().int().positive().nullable(),
  format: z.enum(MEDIA_FORMATS),
  title: z.string().trim().min(1).max(300),
  artist: z.string().trim().min(1).max(300),
  year: z.number().int().min(1800).max(2100).nullable(),
  label: z.string().trim().max(200).nullable(),
  genres: z.array(z.string().trim().min(1).max(80)).max(12),
  coverUrl: z.union([httpsUrl, z.null()]),
  coverThumbUrl: z.union([httpsUrl, z.null()]).optional().transform((value) => value ?? null),
  barcode: z.string().trim().max(64).nullable(),
  catalogNumber: z.string().trim().max(40).nullable().optional().transform((value) => value ?? null),
  condition: z.enum(MEDIA_CONDITIONS).nullable(),
  purchaseLocation: z.string().trim().max(120).nullable(),
  purchaseDate: z.iso.datetime().nullable(),
  notes: z.string().trim().max(4000).nullable(),
  isFavorite: z.boolean(),
  isWishlist: z.boolean(),
  createdAt: z.iso.datetime(),
});

const backupSettingsSchema = z.object({
  vinylEnabled: z.boolean(),
  cassetteEnabled: z.boolean(),
  cdEnabled: z.boolean(),
  theme: z.enum(THEME_PREFERENCES),
  viewMode: z.enum(VIEW_MODES),
  defaultFormat: z.enum(MEDIA_FORMATS).nullable().optional(),
  bio: z.string().trim().max(280).nullable(),
  locale: z.enum(LOCALES).optional().default("en"),
  marketValueEnabled: z.boolean().optional().default(false),
});

const backupSchema = z.object({
  version: z.literal(RESONANCE_BACKUP_VERSION),
  exportedAt: z.iso.datetime(),
  settings: backupSettingsSchema,
  records: z.array(backupRecordSchema).max(MAX_BACKUP_RECORDS),
});

export function parseResonanceBackup(input: unknown): ResonanceBackup {
  const parsed = backupSchema.safeParse(input);

  if (!parsed.success) {
    throw new ValidationError("This does not sound like a Resonance copy.");
  }

  if (!parsed.data.settings.vinylEnabled && !parsed.data.settings.cassetteEnabled && !parsed.data.settings.cdEnabled) {
    throw new ValidationError("This copy has no format left to listen to.");
  }

  return parsed.data;
}

export function backupRecordKey(record: {
  discogsId: number | null;
  format: MediaFormat;
  title: string;
  artist: string;
}): string {
  if (record.discogsId !== null) {
    return `d:${record.discogsId}:${record.format}`;
  }

  return `t:${record.title.trim().toLowerCase()}|${record.artist.trim().toLowerCase()}|${record.format}`;
}

export function freshBackupRecords(
  records: ResonanceBackupRecord[],
  existingKeys: Set<string>,
): ResonanceBackupRecord[] {
  const seen = new Set(existingKeys);
  const fresh: ResonanceBackupRecord[] = [];

  for (const record of records) {
    const key = backupRecordKey(record);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    fresh.push(record);
  }

  return fresh;
}
