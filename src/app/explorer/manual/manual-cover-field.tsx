"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { choiceChipClass } from "@/components/ui/chip";
import { controlBareClass, controlFrameClass, controlIconSlotClass, labelClass } from "@/components/ui/control";
import { useT } from "@/components/locale-provider";
import { shrinkCoverFile } from "@/lib/collection/cover-client";

export function ManualCoverField() {
  const t = useT();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isShrinking, setIsShrinking] = useState(false);
  const shrinking = useRef(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  async function rememberStill(file: File | undefined) {
    if (shrinking.current) {
      return;
    }

    shrinking.current = true;
    setIsShrinking(true);

    try {
      setPreview((current) => {
        if (current) {
          URL.revokeObjectURL(current);
        }
        return null;
      });

      if (!file) {
        return;
      }

      const still = await shrinkCoverFile(file);
      const transfer = new DataTransfer();
      transfer.items.add(still);

      if (fileRef.current) {
        fileRef.current.files = transfer.files;
      }

      setPreview(URL.createObjectURL(still));
    } finally {
      shrinking.current = false;
      setIsShrinking(false);
    }
  }

  function restCover() {
    if (fileRef.current) {
      fileRef.current.value = "";
    }

    setPreview((current) => {
      if (current) {
        URL.revokeObjectURL(current);
      }
      return null;
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor="manual-cover" className={labelClass}>
        {t("explorer.writeCover")}
        <span className="flex items-center gap-3">
          <span
            className="relative size-20 shrink-0 overflow-hidden rounded-rs-sm bg-gradient-to-br from-primary-soft via-surface-pressed to-secondary-soft"
            aria-busy={isShrinking}
          >
            {preview ? (
              <img src={preview} alt="" className="size-full object-cover" />
            ) : (
              <span
                className="absolute inset-0 flex items-center justify-center text-[0.65rem] tracking-[0.2em] text-text-tertiary uppercase"
                aria-hidden
              >
                Resonance
              </span>
            )}
          </span>
          <span className={`min-w-0 flex-1 ${controlFrameClass}`}>
            <span className={controlIconSlotClass} aria-hidden>
              <ImageIcon className="size-4" />
            </span>
            <input
              id="manual-cover"
              ref={fileRef}
              name="cover"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className={`${controlBareClass} pr-3 sm:pr-4`}
              onChange={(event) => {
                void rememberStill(event.target.files?.[0]);
              }}
            />
          </span>
        </span>
      </label>
      <p className="text-sm leading-6 text-text-secondary">{t("explorer.writeCoverHint")}</p>
      {preview ? (
        <button type="button" className={choiceChipClass} onClick={restCover}>
          {t("explorer.writeCoverRemove")}
        </button>
      ) : null}
    </div>
  );
}
