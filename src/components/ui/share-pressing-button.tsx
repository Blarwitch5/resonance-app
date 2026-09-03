"use client";

import { Share } from "lucide-react";
import { useEffect, useState } from "react";

import { Notice } from "@/components/ui/notice";
import { useLocale } from "@/components/locale-provider";
import { browserShareHost, offerPressingShare, sharePressingVoice } from "@/lib/collection/share-pressing";

interface SharePressingButtonProps {
  href: string;
  title: string;
  artist: string;
}

export function SharePressingButton({ href, title, artist }: SharePressingButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voice = sharePressingVoice(title, copied, locale);

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
    setError(null);

    try {
      const outcome = await offerPressingShare({ href, title, artist }, browserShareHost());

      if (outcome === "copied") {
        setCopied(true);
      }
    } catch {
      setError(voice.error);
    }
  }

  return (
    <div className="flex flex-col gap-2">
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
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
