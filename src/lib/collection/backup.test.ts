import { describe, expect, it } from "vitest";

import {
  backupFilename,
  backupRecordKey,
  parseResonanceBackup,
  toResonanceBackup,
  type ResonanceBackupItem,
} from "@/lib/collection/backup";
import { ValidationError } from "@/lib/errors";
import { DEFAULT_USER_SETTINGS } from "@/lib/settings/types";

const item: ResonanceBackupItem = {
  userId: "secret-user",
  id: "secret-row",
  discogsId: 12345,
  format: "vinyl",
  title: "Kind of Blue",
  artist: "Miles Davis",
  year: 1959,
  label: "Columbia",
  genres: ["Jazz"],
  coverUrl: "https://i.discogs.com/kind.jpg",
  barcode: "123",
  condition: "near_mint",
  purchaseLocation: "Reckless Records",
  purchaseDate: new Date("2024-06-01T12:00:00.000Z"),
  notes: "The afternoon it found me.",
  isFavorite: true,
  isWishlist: false,
  createdAt: new Date("2025-01-15T08:00:00.000Z"),
  updatedAt: new Date("2025-01-16T08:00:00.000Z"),
};

describe("toResonanceBackup", () => {
  it("keeps the journal, not the account", () => {
    const backup = toResonanceBackup({
      exportedAt: new Date("2026-08-24T11:00:00.000Z"),
      settings: { ...DEFAULT_USER_SETTINGS, bio: "Still spinning." },
      items: [item],
    });

    expect(backup.version).toBe(1);
    expect(backup.exportedAt).toBe("2026-08-24T11:00:00.000Z");
    expect(JSON.stringify(backup)).not.toContain("secret-user");
    expect(JSON.stringify(backup)).not.toContain("secret-row");
    expect(backup.settings.bio).toBe("Still spinning.");
    expect(backup.settings.defaultFormat).toBe("vinyl");
    expect(backup.records).toEqual([
      {
        discogsId: 12345,
        format: "vinyl",
        title: "Kind of Blue",
        artist: "Miles Davis",
        year: 1959,
        label: "Columbia",
        genres: ["Jazz"],
        coverUrl: "https://i.discogs.com/kind.jpg",
        barcode: "123",
        condition: "near_mint",
        purchaseLocation: "Reckless Records",
        purchaseDate: "2024-06-01T12:00:00.000Z",
        notes: "The afternoon it found me.",
        isFavorite: true,
        isWishlist: false,
        createdAt: "2025-01-15T08:00:00.000Z",
      },
    ]);
  });

  it("stays a quiet shelf when nothing has arrived", () => {
    const backup = toResonanceBackup({
      exportedAt: new Date("2026-08-24T11:00:00.000Z"),
      settings: DEFAULT_USER_SETTINGS,
      items: [],
    });

    expect(backup.records).toEqual([]);
    expect(backup.settings.theme).toBe("auto");
  });
});

describe("backupFilename", () => {
  it("names the file by the day it was taken", () => {
    expect(backupFilename(new Date("2026-08-24T11:00:00.000Z"))).toBe("resonance-2026-08-24.json");
  });
});

describe("parseResonanceBackup", () => {
  it("reads a copy that this journal wrote", () => {
    const backup = toResonanceBackup({
      exportedAt: new Date("2026-08-24T11:00:00.000Z"),
      settings: { ...DEFAULT_USER_SETTINGS, bio: "Still spinning." },
      items: [item],
    });

    expect(parseResonanceBackup(JSON.parse(JSON.stringify(backup)))).toEqual(backup);
  });

  it("still hears an older copy without a leading format", () => {
    const backup = toResonanceBackup({
      exportedAt: new Date("2026-08-24T11:00:00.000Z"),
      settings: DEFAULT_USER_SETTINGS,
      items: [],
    });
    const settings = {
      vinylEnabled: backup.settings.vinylEnabled,
      cassetteEnabled: backup.settings.cassetteEnabled,
      cdEnabled: backup.settings.cdEnabled,
      theme: backup.settings.theme,
      viewMode: backup.settings.viewMode,
      bio: backup.settings.bio,
    };

    expect(parseResonanceBackup({ ...backup, settings }).settings.defaultFormat).toBeUndefined();
  });

  it("ignores an account id smuggled into a record", () => {
    const backup = toResonanceBackup({
      exportedAt: new Date("2026-08-24T11:00:00.000Z"),
      settings: DEFAULT_USER_SETTINGS,
      items: [item],
    });
    const smuggled = {
      ...backup,
      records: [{ ...backup.records[0], userId: "other-user", id: "other-row" }],
    };

    const parsed = parseResonanceBackup(smuggled);
    expect(JSON.stringify(parsed)).not.toContain("other-user");
    expect(JSON.stringify(parsed)).not.toContain("other-row");
  });

  it("refuses a copy that is not this journal", () => {
    expect(() => parseResonanceBackup({ version: 2, records: [] })).toThrow(ValidationError);
    expect(() => parseResonanceBackup({ version: 1, records: [{ title: "" }] })).toThrow(ValidationError);
    expect(() =>
      parseResonanceBackup({
        version: 1,
        exportedAt: "2026-08-24T11:00:00.000Z",
        settings: DEFAULT_USER_SETTINGS,
        records: [
          {
            discogsId: 1,
            format: "vinyl",
            title: "Blue",
            artist: "Miles",
            year: 1959,
            label: null,
            genres: [],
            coverUrl: "javascript:alert(1)",
            barcode: null,
            condition: null,
            purchaseLocation: null,
            purchaseDate: null,
            notes: null,
            isFavorite: false,
            isWishlist: false,
            createdAt: "2026-08-24T11:00:00.000Z",
          },
        ],
      }),
    ).toThrow(ValidationError);
  });
});

describe("backupRecordKey", () => {
  it("keys a pressing by discogs, or by the names on the sleeve", () => {
    expect(backupRecordKey({ discogsId: 12345, format: "vinyl", title: "Kind of Blue", artist: "Miles Davis" })).toBe(
      "d:12345:vinyl",
    );
    expect(backupRecordKey({ discogsId: null, format: "cd", title: "Kind of Blue", artist: "Miles Davis" })).toBe(
      "t:kind of blue|miles davis|cd",
    );
  });
});


