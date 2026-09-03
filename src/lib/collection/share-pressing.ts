import { t } from "@/lib/i18n/translate";
import type { Locale } from "@/lib/settings/types";

export const SHARE_PRESSING_ERROR = "This pressing could not travel just now.";

export interface SharePressingPayload {
  title: string;
  text: string;
  url: string;
}

export interface SharePressingVoice {
  ariaLabel: string;
  label: string;
  error: string;
}

export interface SharePressingHost {
  share?: (data: SharePressingPayload) => Promise<void>;
  writeText?: (text: string) => Promise<void>;
}

export type SharePressingOutcome = "shared" | "copied" | "aborted";

export function sharePressingPayload(href: string, title: string, artist: string): SharePressingPayload {
  return {
    title: `${artist} — ${title}`,
    text: `${title} by ${artist}`,
    url: href,
  };
}

export function sharePressingVoice(title: string, copied: boolean, locale: Locale = "en"): SharePressingVoice {
  return {
    ariaLabel: t(locale, "share.aria", { title }),
    label: copied ? t(locale, "share.copied") : t(locale, "share.label"),
    error: t(locale, "share.error"),
  };
}

export async function offerPressingShare(
  input: { href: string; title: string; artist: string },
  host: SharePressingHost,
): Promise<SharePressingOutcome> {
  const payload = sharePressingPayload(input.href, input.title, input.artist);

  try {
    if (host.share) {
      await host.share(payload);
      return "shared";
    }

    await copyPressingHref(payload.url, host.writeText);
    return "copied";
  } catch (caught) {
    if (isAbort(caught)) {
      return "aborted";
    }

    try {
      await copyPressingHref(payload.url, host.writeText);
      return "copied";
    } catch {
      throw new Error(SHARE_PRESSING_ERROR, { cause: caught });
    }
  }
}

async function copyPressingHref(href: string, writeText: SharePressingHost["writeText"]): Promise<void> {
  if (!writeText) {
    throw new Error(SHARE_PRESSING_ERROR);
  }

  await writeText(href);
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === "AbortError";
}

export function browserShareHost(): SharePressingHost {
  if (typeof navigator === "undefined") {
    return {};
  }

  return {
    share: typeof navigator.share === "function" ? (data) => navigator.share(data) : undefined,
    writeText: navigator.clipboard?.writeText.bind(navigator.clipboard),
  };
}
