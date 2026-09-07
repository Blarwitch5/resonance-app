"use client";

import { Share, Link2Off } from "lucide-react";
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

  const shareControl =
    appearance === "button" ? (
      <Button
        type="button"
        variant="ghost"
        onClick={() => {
          void onShare();
        }}
        aria-label={voice.ariaLabel}
        className="px-3 lg:px-6"
      >
        <Share className="size-4 shrink-0" aria-hidden />
        {voice.label}
      </Button>
    ) : (
      <button
        type="button"
        onClick={() => {
          void onShare();
        }}
        aria-label={voice.ariaLabel}
        className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <Share className="size-4 shrink-0" aria-hidden />
        {voice.label}
      </button>
    );

  const quietControl =
    shared && itemId ? (
      appearance === "button" ? (
        <Button
          type="button"
          variant="ghost"
          onClick={() => {
            void onQuiet();
          }}
          aria-label={t(locale, "listen.stopShareAria")}
          className="px-3 lg:px-6"
        >
          <Link2Off className="size-4 shrink-0" aria-hidden />
          {t(locale, "listen.stopShare")}
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => {
            void onQuiet();
          }}
          aria-label={t(locale, "listen.stopShareAria")}
          className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-text-secondary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          <Link2Off className="size-4 shrink-0" aria-hidden />
          {t(locale, "listen.stopShare")}
        </button>
      )
    ) : null;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        {shareControl}
        {quietControl}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
