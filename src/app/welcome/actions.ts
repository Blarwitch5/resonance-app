"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ValidationError } from "@/lib/errors";
import { localizedError } from "@/lib/i18n/action-error";
import { requireSession } from "@/lib/session";
import { getUserSettings, upsertUserSettings } from "@/lib/settings/repository";
import { enabledFormats, preferredFormat, type UserSettings } from "@/lib/settings/types";

export interface WelcomeState {
  error: string | null;
}

export async function completeOnboardingAction(
  _previous: WelcomeState,
  formData: FormData,
): Promise<WelcomeState> {
  const session = await requireSession();
  const current = await getUserSettings(session.user.id);

  try {
    const intent = String(formData.get("intent") ?? "");

    if (intent !== "start" && intent !== "skip") {
      throw new ValidationError("This journal could not be opened.");
    }

    const patch =
      intent === "skip" ? withOnboarded(current) : withOnboarded(current, readFormats(formData));

    await upsertUserSettings(session.user.id, patch);
  } catch (error) {
    return { error: localizedError(current.locale, error) };
  }

  revalidatePath("/collection");
  revalidatePath("/explorer");
  revalidatePath("/profile");
  redirect("/collection");
}

function readFormats(formData: FormData): Pick<UserSettings, "vinylEnabled" | "cassetteEnabled" | "cdEnabled"> {
  const vinylEnabled = formData.get("vinylEnabled") === "on";
  const cassetteEnabled = formData.get("cassetteEnabled") === "on";
  const cdEnabled = formData.get("cdEnabled") === "on";

  if (!vinylEnabled && !cassetteEnabled && !cdEnabled) {
    throw new ValidationError("Keep at least one format on your shelf.");
  }

  return { vinylEnabled, cassetteEnabled, cdEnabled };
}

function withOnboarded(
  current: UserSettings,
  formats?: Pick<UserSettings, "vinylEnabled" | "cassetteEnabled" | "cdEnabled">,
): UserSettings {
  const next = {
    ...current,
    ...formats,
    onboardedAt: new Date(),
  };

  return {
    ...next,
    defaultFormat: preferredFormat(enabledFormats(next), next.defaultFormat),
  };
}
