"use client";

import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ensureSharedPressingAction, quietSharedPressingAction } from "@/app/listen/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useLocale } from "@/components/locale-provider";
import { browserShareHost, offerPressingShare, sharePressingVoice } from "@/lib/collection/share-pressing";
import { t } from "@/lib/i18n/translate";

interface SharePressingButtonProps {
  title: string;
  artist: string;
  href?: string | null;
  itemId?: string | null;
  /** Already has an unlisted listen link. */
  isShared?: boolean;
  /** `button` = visible ghost control; `link` = quiet text under Discogs. */
  appearance?: "button" | "link";
}

const shareOnlyClass = "size-11 shrink-0 px-0 sm:size-12";

export function SharePressingButton({
  href = null,
  itemId = null,
  title,
  artist,
  isShared = false,
  appearance = "link",
}: SharePressingButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [shared, setShared] = useState(isShared);
  const [error, setError] = useState<string | null>(null);
  const voice = sharePressingVoice(title, copied, locale);
  const canShare = Boolean(href || itemId);
  const stopLabel = t(locale, "listen.stopShareQuiet");
  const stopAria = t(locale, "listen.stopShareAria");

  useEffect(() => {
    setShared(isShared);
  }, [isShared]);

  useEffect(() => {
    if (!copied) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCopied(false);
    }, 2400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [copied]);

  async function onShare(): Promise<void> {
    if (!canShare) {
      return;
    }

    setError(null);

    try {
      let shareHref = href;

      if (itemId) {
        const result = await ensureSharedPressingAction(itemId);

        if (result.error || !result.href) {
          setError(result.error ?? voice.error);
          return;
        }

        shareHref = result.href;
        setShared(true);
      }

      if (!shareHref) {
        return;
      }

      const outcome = await offerPressingShare(
        { href: shareHref, title, artist },
        browserShareHost(),
        window.location.origin,
      );

      if (outcome === "copied") {
        setCopied(true);
      }
    } catch {
      setError(voice.error);
    }
  }

  async function onQuiet(): Promise<void> {
    if (!itemId) {
      return;
    }

    setError(null);

    try {
      const result = await quietSharedPressingAction(itemId);

      if (result.error) {
        setError(result.error);
        return;
      }

      setShared(false);
      setCopied(false);
    } catch {
      setError(t(locale, "listen.stopShareError"));
    }
  }

  if (!canShare) {
    return null;
  }

  const quietControl =
    shared && itemId ? (
      <button
        type="button"
        onClick={() => {
          void onQuiet();
        }}
        aria-label={stopAria}
        className="text-xs font-medium text-text-tertiary outline-none hover:text-text-secondary focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        {stopLabel}
      </button>
    ) : null;

  if (appearance === "button") {
    return (
      <div className="relative shrink-0">
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void onShare();
          }}
          aria-label={voice.ariaLabel}
          title={voice.ariaLabel}
          className={shareOnlyClass}
        >
          <Share2 className="size-4 shrink-0" aria-hidden />
        </Button>
        {quietControl ? (
          <div className="absolute top-full left-0 z-20 mt-1 whitespace-nowrap rounded-rs-sm bg-surface-elevated px-2 py-1 ring-1 ring-border">
            {quietControl}
          </div>
        ) : null}
        {error ? (
          <div className="absolute top-full left-0 z-20 mt-1 w-44">
            <Notice tone="error">{error}</Notice>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="flex min-w-0 flex-col items-start gap-1">
      <button
        type="button"
        onClick={() => {
          void onShare();
        }}
        aria-label={voice.ariaLabel}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <Share2 className="size-4 shrink-0" aria-hidden />
        {voice.label}
      </button>
      {quietControl}
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
