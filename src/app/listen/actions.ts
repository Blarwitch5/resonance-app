"use server";

import { z } from "zod";

import { MEDIA_CONDITIONS, MEDIA_FORMATS, type CollectionQuery } from "@/lib/collection/types";
import { toErrorMessage } from "@/lib/errors";
import { listenHref, listenShelfHref } from "@/lib/listen/href";
import {
  createOrGetSharedPressing,
  createSharedShelf,
  deleteSharedPressingForItem,
  deleteSharedShelf,
} from "@/lib/listen/repository";
import { isShareToken } from "@/lib/listen/token";
import { requireSession } from "@/lib/session";
import { getUserSettings } from "@/lib/settings/repository";

const itemIdSchema = z.string().uuid();

const shareShelfListenSchema = z.object({
  format: z.enum(MEDIA_FORMATS).optional(),
  query: z.string().trim().max(200).optional(),
  sort: z.enum(["recent", "artist", "year", "found"]).optional(),
  keptClose: z.boolean().optional(),
  artist: z.string().trim().max(200).optional(),
  genre: z.string().trim().max(200).optional(),
  decade: z.number().int().optional(),
  label: z.string().trim().max(200).optional(),
  found: z.string().trim().max(200).optional(),
  condition: z.enum(MEDIA_CONDITIONS).optional(),
  when: z.number().int().optional(),
  arrived: z.number().int().optional(),
  year: z.number().int().optional(),
});

export async function ensureSharedPressingAction(
  itemId: string,
): Promise<{ href: string; token: string; error: null } | { href: null; token: null; error: string }> {
  const parsed = itemIdSchema.safeParse(itemId);

  if (!parsed.success) {
    return { href: null, token: null, error: "This pressing could not travel just now." };
  }

  try {
    const session = await requireSession();
    const { token } = await createOrGetSharedPressing(session.user.id, parsed.data);
    return { href: listenHref(token), token, error: null };
  } catch (error) {
    return { href: null, token: null, error: toErrorMessage(error) };
  }
}

export async function quietSharedPressingAction(
  itemId: string,
): Promise<{ error: string | null }> {
  const parsed = itemIdSchema.safeParse(itemId);

  if (!parsed.success) {
    return { error: "This link could not be quieted." };
  }

  try {
    const session = await requireSession();
    await deleteSharedPressingForItem(session.user.id, parsed.data);
    return { error: null };
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
}

export async function ensureSharedShelfAction(
  listen: CollectionQuery,
): Promise<{ href: string; token: string; error: null } | { href: null; token: null; error: string }> {
  const parsed = shareShelfListenSchema.safeParse(listen);

  if (!parsed.success) {
    return { href: null, token: null, error: "This shelf could not travel just now." };
  }

  try {
    const session = await requireSession();
    const settings = await getUserSettings(session.user.id);
    const { token } = await createSharedShelf(session.user.id, parsed.data, settings.locale);
    return { href: listenShelfHref(token), token, error: null };
  } catch (error) {
    return { href: null, token: null, error: toErrorMessage(error) };
  }
}

export async function quietSharedShelfAction(token: string): Promise<{ error: string | null }> {
  if (!isShareToken(token)) {
    return { error: "This link could not be quieted." };
  }

  try {
    const session = await requireSession();
    await deleteSharedShelf(session.user.id, token);
    return { error: null };
  } catch (error) {
    return { error: toErrorMessage(error) };
  }
}
