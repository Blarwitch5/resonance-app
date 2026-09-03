"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { deleteCollectionItem, updateCollectionItem } from "@/lib/collection/repository";
import { MEDIA_CONDITIONS } from "@/lib/collection/types";
import { ValidationError } from "@/lib/errors";
import { localizedError } from "@/lib/i18n/action-error";
import { requireSession } from "@/lib/session";
import { loadUserSettings } from "@/lib/settings/repository";

export interface UpdateItemState {
  error: string | null;
  saved: boolean;
}

const memorySchema = z.object({
  id: z.string().uuid(),
  notes: z.string().max(4000),
  condition: z.union([z.literal(""), z.enum(MEDIA_CONDITIONS)]),
  purchaseLocation: z.string().trim().max(120),
  purchaseDate: z.union([z.literal(""), z.string().regex(/^\d{4}-\d{2}-\d{2}$/)]),
});

function parsePurchaseDate(value: string): Date | null {
  if (value.length === 0) {
    return null;
  }

  const date = new Date(`${value}T12:00:00.000Z`);

  if (Number.isNaN(date.getTime())) {
    throw new ValidationError("That date could not be kept.");
  }

  return date;
}

export async function updateItemAction(
  _previous: UpdateItemState,
  formData: FormData,
): Promise<UpdateItemState> {
  const session = await requireSession();

  try {
    const parsed = memorySchema.safeParse({
      id: String(formData.get("id") ?? ""),
      notes: String(formData.get("notes") ?? ""),
      condition: String(formData.get("condition") ?? ""),
      purchaseLocation: String(formData.get("purchaseLocation") ?? ""),
      purchaseDate: String(formData.get("purchaseDate") ?? ""),
    });

    if (!parsed.success) {
      throw new ValidationError("This memory could not be saved.");
    }

    const notes = parsed.data.notes.trim();
    const location = parsed.data.purchaseLocation;

    await updateCollectionItem(session.user.id, parsed.data.id, {
      notes: notes.length > 0 ? notes : null,
      condition: parsed.data.condition === "" ? null : parsed.data.condition,
      purchaseLocation: location.length > 0 ? location : null,
      purchaseDate: parsePurchaseDate(parsed.data.purchaseDate),
    });

    return { error: null, saved: true };
  } catch (error) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error), saved: false };
  }
}

export interface ToggleKeptCloseState {
  error: string | null;
}

export async function toggleKeptCloseAction(
  _previous: ToggleKeptCloseState,
  formData: FormData,
): Promise<ToggleKeptCloseState> {
  const session = await requireSession();
  const parsed = z.string().uuid().safeParse(String(formData.get("id") ?? ""));

  if (!parsed.success) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, new ValidationError("This record could not be kept close.")) };
  }

  try {
    await updateCollectionItem(session.user.id, parsed.data, {
      isFavorite: String(formData.get("keep") ?? "") === "1",
    });
  } catch (error) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error) };
  }

  revalidatePath("/collection");
  revalidatePath("/profile");
  revalidatePath(`/collection/${parsed.data}`);
  return { error: null };
}

export interface ReleaseItemState {
  error: string | null;
}

export async function releaseItemAction(
  _previous: ReleaseItemState,
  formData: FormData,
): Promise<ReleaseItemState> {
  const session = await requireSession();
  const parsed = z.string().uuid().safeParse(String(formData.get("id") ?? ""));

  if (!parsed.success) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, new ValidationError("This record could not be released.")) };
  }

  try {
    await deleteCollectionItem(session.user.id, parsed.data);
  } catch (error) {
    return { error: localizedError((await loadUserSettings(session.user.id)).locale, error) };
  }

  revalidatePath("/collection");
  revalidatePath("/profile");
  revalidatePath(`/collection/${parsed.data}`);
  redirect("/collection");
}
