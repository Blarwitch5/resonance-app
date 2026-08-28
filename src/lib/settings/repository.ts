import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { DatabaseError } from "@/lib/errors";
import { DEFAULT_USER_SETTINGS, parseLocale, type UserSettings } from "@/lib/settings/types";

const settingsColumns = {
  vinylEnabled: userSettings.vinylEnabled,
  cassetteEnabled: userSettings.cassetteEnabled,
  cdEnabled: userSettings.cdEnabled,
  theme: userSettings.theme,
  viewMode: userSettings.viewMode,
  defaultFormat: userSettings.defaultFormat,
  bio: userSettings.bio,
  locale: userSettings.locale,
  marketValueEnabled: userSettings.marketValueEnabled,
  onboardedAt: userSettings.onboardedAt,
} as const;

function toUserSettings(row: {
  vinylEnabled: boolean;
  cassetteEnabled: boolean;
  cdEnabled: boolean;
  theme: UserSettings["theme"];
  viewMode: UserSettings["viewMode"];
  defaultFormat: UserSettings["defaultFormat"];
  bio: string | null;
  locale: string;
  marketValueEnabled: boolean;
  onboardedAt: Date | null;
}): UserSettings {
  return {
    vinylEnabled: row.vinylEnabled,
    cassetteEnabled: row.cassetteEnabled,
    cdEnabled: row.cdEnabled,
    theme: row.theme,
    viewMode: row.viewMode,
    defaultFormat: row.defaultFormat,
    bio: row.bio,
    locale: parseLocale(row.locale) ?? DEFAULT_USER_SETTINGS.locale,
    marketValueEnabled: row.marketValueEnabled,
    onboardedAt: row.onboardedAt,
  };
}

export const getUserSettings = cache(async (userId: string): Promise<UserSettings> => {
  try {
    const [row] = await getDb()
      .select(settingsColumns)
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!row) {
      return DEFAULT_USER_SETTINGS;
    }

    return toUserSettings(row);
  } catch (error) {
    throw new DatabaseError("Your settings could not be loaded.", { cause: error });
  }
});

export async function upsertUserSettings(
  userId: string,
  patch: UserSettings,
): Promise<UserSettings> {
  try {
    const [saved] = await getDb()
      .insert(userSettings)
      .values({
        userId,
        vinylEnabled: patch.vinylEnabled,
        cassetteEnabled: patch.cassetteEnabled,
        cdEnabled: patch.cdEnabled,
        theme: patch.theme,
        viewMode: patch.viewMode,
        defaultFormat: patch.defaultFormat,
        bio: patch.bio,
        locale: patch.locale,
        marketValueEnabled: patch.marketValueEnabled,
        onboardedAt: patch.onboardedAt,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: userSettings.userId,
        set: {
          vinylEnabled: patch.vinylEnabled,
          cassetteEnabled: patch.cassetteEnabled,
          cdEnabled: patch.cdEnabled,
          theme: patch.theme,
          viewMode: patch.viewMode,
          defaultFormat: patch.defaultFormat,
          bio: patch.bio,
          locale: patch.locale,
          marketValueEnabled: patch.marketValueEnabled,
          onboardedAt: patch.onboardedAt,
          updatedAt: new Date(),
        },
      })
      .returning(settingsColumns);

    if (!saved) {
      throw new DatabaseError("Your settings could not be saved.");
    }

    return toUserSettings(saved);
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError("Your settings could not be saved.", { cause: error });
  }
}
