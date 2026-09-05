"use client";

import { Barcode, Hash } from "lucide-react";
import { useEffect, useState } from "react";

import { Notice } from "@/components/ui/notice";
import { PressingText } from "@/components/ui/pressing-text";
import { hintClass, kickerClass } from "@/components/ui/type";
import { useLocale } from "@/components/locale-provider";
import { pressingCopyVoice, type PressingCopyKind } from "@/lib/collection/copy-pressing";

interface CopyPressingButtonProps {
  kind: PressingCopyKind;
  value: string;
}

const icons = {
  catalog: Hash,
  barcode: Barcode,
} as const;

export function CopyPressingButton({ kind, value }: CopyPressingButtonProps) {
  const locale = useLocale();
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voice = pressingCopyVoice(kind, value, copied, locale);
  const Icon = icons[kind];

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

  async function onCopy(): Promise<void> {
    const failure = pressingCopyVoice(kind, value, false, locale).error;
    setError(null);

    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error("Clipboard is unavailable.");
      }

      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      setError(failure);
    }
  }

  return (
    <div className="flex flex-col gap-1">
      <button
        type="button"
        onClick={() => {
          void onCopy();
        }}
        aria-label={voice.ariaLabel}
        className="flex min-h-11 flex-col justify-center gap-0.5 text-left outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        <span className="flex items-center gap-2">
          <Icon className="size-4 shrink-0 text-text-tertiary" aria-hidden />
          <span className={kickerClass}>{voice.kind}</span>
        </span>
        <span className="pl-6 font-mono text-xs leading-5 text-text-secondary">
          <PressingText>{voice.label}</PressingText>
        </span>
      </button>
      <p className={`hidden pl-6 lg:block ${hintClass}`}>{voice.hint}</p>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
