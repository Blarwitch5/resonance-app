"use client";

import { ImageIcon } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

import { choiceChipClass } from "@/components/ui/chip";
import {
  controlBareClass,
  controlFrameClass,
  controlIconSlotClass,
  labelClass,
} from "@/components/ui/control";
import { t } from "@/lib/i18n/translate";
import { shrinkPortraitFile } from "@/lib/profile/portrait-client";
import { initialsFromName } from "@/lib/profile/types";
import type { Locale } from "@/lib/settings/types";

interface PortraitFieldProps {
  locale: Locale;
  name: string;
  imageUrl?: string | null;
}

export function PortraitField({ locale, name, imageUrl = null }: PortraitFieldProps) {
  const fieldId = useId();
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [remove, setRemove] = useState(false);
  const shrinking = useRef(false);

  useEffect(() => {
    return () => {
      if (preview) {
        URL.revokeObjectURL(preview);
      }
    };
  }, [preview]);

  const shown = remove ? null : (preview ?? imageUrl);
  const initials = initialsFromName(name);

  async function rememberStill(file: File | undefined) {
    if (shrinking.current) {
      return;
    }

    shrinking.current = true;

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

      const still = await shrinkPortraitFile(file);
      const transfer = new DataTransfer();
      transfer.items.add(still);

      if (fileRef.current) {
        fileRef.current.files = transfer.files;
      }

      setRemove(false);
      setPreview(URL.createObjectURL(still));
    } finally {
      shrinking.current = false;
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={fieldId} className={labelClass}>
        {t(locale, "settings.portrait")}
        <span className="flex items-center gap-3">
          <span className="flex size-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary-soft text-lg font-semibold text-on-primary-soft">
            {shown ? (
              <img src={shown} alt="" className="size-20 object-cover" />
            ) : (
              <span aria-hidden>{initials}</span>
            )}
          </span>
          <span className={`min-w-0 flex-1 ${controlFrameClass}`}>
            <span className={controlIconSlotClass} aria-hidden>
              <ImageIcon className="size-4" />
            </span>
            <input
              id={fieldId}
              ref={fileRef}
              name="portrait"
              type="file"
              accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
              className={`${controlBareClass} pr-3 sm:pr-4`}
              onChange={(event) => {
                const file = event.target.files?.[0];
                void rememberStill(file);
              }}
            />
          </span>
        </span>
      </label>
      <p className="text-sm leading-6 text-text-secondary">{t(locale, "settings.portraitHint")}</p>
      {imageUrl ? (
        <label className={choiceChipClass}>
          <input
            type="checkbox"
            name="removePortrait"
            checked={remove}
            className="sr-only"
            onChange={(event) => {
              setRemove(event.target.checked);
              if (event.target.checked) {
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
            }}
          />
          {t(locale, "settings.portraitRemove")}
        </label>
      ) : null}
    </div>
  );
}
