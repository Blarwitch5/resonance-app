"use client";

import { Share2 } from "lucide-react";
import { useEffect, useState } from "react";

import { ensureSharedShelfAction, quietSharedShelfAction } from "@/app/listen/actions";
import { Button } from "@/components/ui/button";
import { Notice } from "@/components/ui/notice";
import { useLocale } from "@/components/locale-provider";
import type { CollectionQuery } from "@/lib/collection/types";
import { browserShareHost, offerLinkShare } from "@/lib/collection/share-pressing";
import { t } from "@/lib/i18n/translate";

interface ShareShelfButtonProps {
  listen: CollectionQuery;
  disabled?: boolean;
  isFiltered?: boolean;
}

const shareOnlyClass = "size-11 shrink-0 px-0 sm:size-12";

export function ShareShelfButton({
  listen,
  disabled = false,
  isFiltered = false,
}: ShareShelfButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const label = copied ? t(locale, "share.copied") : t(locale, "listen.shareShelf");
  const ariaLabel = copied
    ? label
    : isFiltered
      ? t(locale, "listen.shareShelfFilteredAria")
      : t(locale, "listen.shareShelfAria");
  const stopLabel = t(locale, "listen.stopShareQuiet");
  const stopAria = t(locale, "listen.stopShareAria");

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
    if (disabled) {
      return;
    }

    setError(null);

    try {
      const result = await ensureSharedShelfAction(listen);

      if (result.error || !result.href || !result.token) {
        setError(result.error ?? t(locale, "listen.shareShelfError"));
        return;
      }

      setActiveToken(result.token);

      const outcome = await offerLinkShare(
        {
          href: result.href,
          title: t(locale, "listen.shareShelfTitle"),
        },
        browserShareHost(),
        window.location.origin,
      );

      if (outcome === "copied") {
        setCopied(true);
      }
    } catch {
      setError(t(locale, "listen.shareShelfError"));
    }
  }

  async function onQuiet(): Promise<void> {
    if (!activeToken) {
      return;
    }

    setError(null);

    try {
      const result = await quietSharedShelfAction(activeToken);

      if (result.error) {
        setError(result.error);
        return;
      }

      setActiveToken(null);
      setCopied(false);
    } catch {
      setError(t(locale, "listen.stopShareError"));
    }
  }

  return (
    <div className="relative shrink-0">
      <Button
        type="button"
        variant="ghost"
        disabled={disabled}
        onClick={() => {
          void onShare();
        }}
        aria-label={ariaLabel}
        title={ariaLabel}
        className={shareOnlyClass}
      >
        <Share2 className="size-4 shrink-0" aria-hidden />
      </Button>
      {activeToken ? (
        <button
          type="button"
          onClick={() => {
            void onQuiet();
          }}
          aria-label={stopAria}
          className="absolute top-full right-0 z-20 mt-1 whitespace-nowrap rounded-rs-sm bg-surface-elevated px-2 py-1 text-xs font-medium text-text-secondary outline-none ring-1 ring-border hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
        >
          {stopLabel}
        </button>
      ) : null}
      {error ? (
        <div className="absolute top-full right-0 z-20 mt-1 w-44">
          <Notice tone="error">{error}</Notice>
        </div>
      ) : null}
    </div>
  );
}
