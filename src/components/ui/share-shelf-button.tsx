"use client";

import { Share, Link2Off } from "lucide-react";
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
}

export function ShareShelfButton({ listen, disabled = false }: ShareShelfButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [activeToken, setActiveToken] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const label = copied ? t(locale, "share.copied") : t(locale, "listen.shareShelf");

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
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          variant="ghost"
          disabled={disabled}
          onClick={() => {
            void onShare();
          }}
          aria-label={t(locale, "listen.shareShelfAria")}
          className="px-3 lg:px-6"
        >
          <Share className="size-4 shrink-0" aria-hidden />
          <span className="hidden sm:inline">{label}</span>
        </Button>
        {activeToken ? (
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
            <span className="hidden sm:inline">{t(locale, "listen.stopShare")}</span>
          </Button>
        ) : null}
      </div>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
