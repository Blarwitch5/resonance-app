import "server-only";

import { eq } from "drizzle-orm";
import { cache } from "react";

import { getDb } from "@/db";
import { userSettings } from "@/db/schema";
import { DatabaseError } from "@/lib/errors";
import { DEFAULT_USER_SETTINGS, type UserSettings } from "@/lib/settings/types";

export const getUserSettings = cache(async (userId: string): Promise<UserSettings> => {
  try {
    const [row] = await getDb()
      .select({
        vinylEnabled: userSettings.vinylEnabled,
        cassetteEnabled: userSettings.cassetteEnabled,
        cdEnabled: userSettings.cdEnabled,
        theme: userSettings.theme,
        viewMode: userSettings.viewMode,
        defaultFormat: userSettings.defaultFormat,
        bio: userSettings.bio,
        onboardedAt: userSettings.onboardedAt,
      })
      .from(userSettings)
      .where(eq(userSettings.userId, userId))
      .limit(1);

    if (!row) {
      return DEFAULT_USER_SETTINGS;
    }

    return {
      vinylEnabled: row.vinylEnabled,
      cassetteEnabled: row.cassetteEnabled,
      cdEnabled: row.cdEnabled,
      theme: row.theme,
      viewMode: row.viewMode,
      defaultFormat: row.defaultFormat,
      bio: row.bio,
      onboardedAt: row.onboardedAt,
    };
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
          onboardedAt: patch.onboardedAt,
          updatedAt: new Date(),
        },
      })
      .returning({
        vinylEnabled: userSettings.vinylEnabled,
        cassetteEnabled: userSettings.cassetteEnabled,
        cdEnabled: userSettings.cdEnabled,
        theme: userSettings.theme,
        viewMode: userSettings.viewMode,
        defaultFormat: userSettings.defaultFormat,
        bio: userSettings.bio,
        onboardedAt: userSettings.onboardedAt,
      });

    if (!saved) {
      throw new DatabaseError("Your settings could not be saved.");
    }

    return saved;
  } catch (error) {
    if (error instanceof DatabaseError) {
      throw error;
    }

    throw new DatabaseError("Your settings could not be saved.", { cause: error });
  }
}
