"use client";

import { useEffect, useState } from "react";

import { Notice } from "@/components/ui/notice";
import { pressingCopyVoice, type PressingCopyKind } from "@/lib/collection/copy-pressing";

interface CopyPressingButtonProps {
  kind: PressingCopyKind;
  value: string;
}

export function CopyPressingButton({ kind, value }: CopyPressingButtonProps) {
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const voice = pressingCopyVoice(kind, value, copied);

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
    const failure = pressingCopyVoice(kind, value, false).error;
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
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={() => {
          void onCopy();
        }}
        aria-label={voice.ariaLabel}
        className="inline-flex min-h-11 items-center font-mono text-xs leading-5 text-text-tertiary outline-none hover:text-text focus-visible:ring-2 focus-visible:ring-border-strong"
      >
        {voice.label}
      </button>
      {error ? <Notice tone="error">{error}</Notice> : null}
    </div>
  );
}
