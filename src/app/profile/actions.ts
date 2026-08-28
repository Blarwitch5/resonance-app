"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { auth } from "@/lib/auth";
import { MAX_BACKUP_BYTES, parseResonanceBackup } from "@/lib/collection/backup";
import { addCollectionItems, restoreCollectionItems } from "@/lib/collection/repository";
import type { CollectionKind, ReleaseDraft } from "@/lib/collection/types";
import { listDiscogsUserShelves } from "@/lib/discogs/client";
import { AppError, DatabaseError, toErrorMessage, ValidationError } from "@/lib/errors";
import { parsePasswordChange, passwordChangeFailure } from "@/lib/profile/password";
import { parseDisplayName, parsePortraitUrl } from "@/lib/profile/types";
import { requireSession } from "@/lib/session";
import { getUserSettings, upsertUserSettings } from "@/lib/settings/repository";
import { enabledFormats, parseDefaultFormat, parseLocale, parseThemePreference, parseViewMode, preferredFormat, type UserSettings } from "@/lib/settings/types";

export interface SaveSettingsState {
  error: string | null;
  saved: boolean;
}

const bioSchema = z.string().trim().max(280);

export async function saveSettingsAction(
  _previous: SaveSettingsState,
  formData: FormData,
): Promise<SaveSettingsState> {
  const session = await requireSession();

  try {
    const name = parseDisplayName(String(formData.get("name") ?? ""));

    if (!name) {
      throw new ValidationError("A name stays between 1 and 80 characters.");
    }

    const portrait = parsePortraitUrl(String(formData.get("portrait") ?? ""));

    if (portrait === undefined) {
      throw new ValidationError("A portrait needs a quiet HTTPS link.");
    }

    const bioResult = bioSchema.safeParse(String(formData.get("bio") ?? ""));

    if (!bioResult.success) {
      throw new ValidationError("A bio stays under 280 characters.");
    }

    const theme = parseThemePreference(String(formData.get("theme") ?? ""));

    if (!theme) {
      throw new ValidationError("Choose light, dark, or auto.");
    }

    const vinylEnabled = formData.get("vinylEnabled") === "on";
    const cassetteEnabled = formData.get("cassetteEnabled") === "on";
    const cdEnabled = formData.get("cdEnabled") === "on";

    if (!vinylEnabled && !cassetteEnabled && !cdEnabled) {
      throw new ValidationError("Keep at least one format on your shelf.");
    }

    const current = await getUserSettings(session.user.id);
    const viewMode = parseViewMode(String(formData.get("viewMode") ?? "")) ?? current.viewMode;
    const locale = parseLocale(String(formData.get("locale") ?? "")) ?? current.locale;
    const marketValueEnabled = formData.get("marketValueEnabled") === "on";
    const formats = { vinylEnabled, cassetteEnabled, cdEnabled };
    const defaultFormat = preferredFormat(
      enabledFormats({ ...current, ...formats }),
      parseDefaultFormat(String(formData.get("defaultFormat") ?? "")) ?? current.defaultFormat,
    );
    const patch: UserSettings = {
      theme,
      viewMode,
      locale,
      marketValueEnabled,
      ...formats,
      defaultFormat,
      bio: bioResult.data.length > 0 ? bioResult.data : null,
      onboardedAt: current.onboardedAt,
    };

    await upsertUserSettings(session.user.id, patch);

    const currentImage = session.user.image ?? null;

    if (name !== session.user.name || portrait !== currentImage) {
      try {
        await auth.api.updateUser({
          body: {
            ...(name !== session.user.name ? { name } : {}),
            ...(portrait !== currentImage ? { image: portrait } : {}),
          },
          headers: await headers(),
        });
      } catch (error) {
        throw new DatabaseError("Your space could not be saved.", { cause: error });
      }
    }

    revalidatePath("/", "layout");
    revalidatePath("/collection");
    revalidatePath("/explorer");
    revalidatePath("/profile");
    return { error: null, saved: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message, saved: false };
    }

    return { error: toErrorMessage(error), saved: false };
  }
}

export interface ImportDiscogsState {
  error: string | null;
  added: number | null;
  skipped: number | null;
  truncated: boolean;
}

const usernameSchema = z
  .string()
  .trim()
  .regex(/^[A-Za-z0-9][A-Za-z0-9_-]{1,39}$/);

const initialImportCounts = { added: null, skipped: null, truncated: false } as const;

export async function importDiscogsAction(
  _previous: ImportDiscogsState,
  formData: FormData,
): Promise<ImportDiscogsState> {
  const session = await requireSession();

  try {
    const parsed = usernameSchema.safeParse(String(formData.get("username") ?? ""));

    if (!parsed.success) {
      throw new ValidationError("That Discogs name does not look right.");
    }

    const settings = await getUserSettings(session.user.id);
    const formats = enabledFormats(settings);
    const shelves = await listDiscogsUserShelves(parsed.data);

    const owned = shelves.owned.filter((draft) => formats.includes(draft.format));
    const ownedKeys = new Set(
      owned.flatMap((draft) => (draft.discogsId === null ? [] : [`${draft.discogsId}:${draft.format}`])),
    );
    const wanted = shelves.wanted.filter((draft) => {
      if (!formats.includes(draft.format) || draft.discogsId === null) {
        return false;
      }

      return !ownedKeys.has(`${draft.discogsId}:${draft.format}`);
    });

    if (shelves.owned.length === 0 && shelves.wanted.length === 0) {
      throw new ValidationError("That shelf looks empty.");
    }

    const entries: Array<{ draft: ReleaseDraft; kind: CollectionKind }> = [
      ...owned.map((draft) => ({ draft, kind: "owned" as const })),
      ...wanted.map((draft) => ({ draft, kind: "wishlist" as const })),
    ];

    if (entries.length === 0) {
      throw new ValidationError("Nothing on that shelf matched the formats you keep.");
    }

    const result = await addCollectionItems(session.user.id, entries);
    revalidatePath("/profile");
    revalidatePath("/collection");

    return {
      error: null,
      added: result.added,
      skipped: result.skipped,
      truncated: shelves.truncated,
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message, ...initialImportCounts };
    }

    return { error: toErrorMessage(error), ...initialImportCounts };
  }
}

export interface RestoreResonanceState {
  error: string | null;
  added: number | null;
  skipped: number | null;
}

const initialRestoreCounts = { added: null, skipped: null } as const;

export async function restoreResonanceAction(
  _previous: RestoreResonanceState,
  formData: FormData,
): Promise<RestoreResonanceState> {
  const session = await requireSession();
  const file = formData.get("backup");

  try {
    if (!(file instanceof File) || file.size === 0) {
      throw new ValidationError("Choose a Resonance copy to bring home.");
    }

    if (file.size > MAX_BACKUP_BYTES) {
      throw new ValidationError("This copy is too large to bring home at once.");
    }

    let payload: unknown;

    try {
      payload = JSON.parse(await file.text());
    } catch {
      throw new ValidationError("This does not sound like a Resonance copy.");
    }

    const backup = parseResonanceBackup(payload);
    const current = await getUserSettings(session.user.id);
    const restored = await restoreCollectionItems(session.user.id, backup.records);

    await upsertUserSettings(session.user.id, {
      vinylEnabled: backup.settings.vinylEnabled,
      cassetteEnabled: backup.settings.cassetteEnabled,
      cdEnabled: backup.settings.cdEnabled,
      theme: backup.settings.theme,
      viewMode: backup.settings.viewMode,
      defaultFormat: preferredFormat(
        enabledFormats({
          ...current,
          vinylEnabled: backup.settings.vinylEnabled,
          cassetteEnabled: backup.settings.cassetteEnabled,
          cdEnabled: backup.settings.cdEnabled,
        }),
        backup.settings.defaultFormat ?? current.defaultFormat,
      ),
      bio: backup.settings.bio,
      locale: backup.settings.locale ?? current.locale,
      marketValueEnabled: backup.settings.marketValueEnabled ?? current.marketValueEnabled,
      onboardedAt: current.onboardedAt ?? new Date(),
    });

    revalidatePath("/profile");
    revalidatePath("/collection");

    return { error: null, added: restored.added, skipped: restored.skipped };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message, ...initialRestoreCounts };
    }

    return { error: toErrorMessage(error), ...initialRestoreCounts };
  }
}

export interface ChangePasswordState {
  error: string | null;
  changed: boolean;
}

export async function changePasswordAction(
  _previous: ChangePasswordState,
  formData: FormData,
): Promise<ChangePasswordState> {
  await requireSession();

  try {
    const parsed = parsePasswordChange({
      current: String(formData.get("currentPassword") ?? ""),
      next: String(formData.get("newPassword") ?? ""),
      confirm: String(formData.get("confirmPassword") ?? ""),
    });

    if (!parsed.ok) {
      throw new ValidationError(parsed.message);
    }

    try {
      await auth.api.changePassword({
        body: {
          currentPassword: parsed.currentPassword,
          newPassword: parsed.newPassword,
          revokeOtherSessions: true,
        },
        headers: await headers(),
      });
    } catch (error) {
      throw new ValidationError(passwordChangeFailure(error));
    }

    revalidatePath("/profile");
    return { error: null, changed: true };
  } catch (error) {
    if (error instanceof AppError) {
      return { error: error.message, changed: false };
    }

    return { error: passwordChangeFailure(error), changed: false };
  }
}
