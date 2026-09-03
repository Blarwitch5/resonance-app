"use client";

import { BookmarkPlus, FaceSlightlySmilingPlus, Library } from "lucide-react";
import { useActionState } from "react";

import { addReleaseAction, type AddReleaseState } from "@/app/explorer/actions";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { TextAreaField } from "@/components/ui/field";
import { formatIcons } from "@/components/ui/format-icon";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import { MEDIA_FORMATS, type MediaFormat } from "@/lib/collection/types";

const initialState: AddReleaseState = { error: null };

interface AddReleaseFormProps {
  discogsId: number;
  defaultFormat: MediaFormat;
  formats: MediaFormat[];
}

export function AddReleaseForm({ discogsId, defaultFormat, formats }: AddReleaseFormProps) {
  const t = useT();
  const [state, formAction, isPending] = useActionState(addReleaseAction, initialState);
  const available = formats.length > 0 ? formats : [...MEDIA_FORMATS];
  const selected = available.includes(defaultFormat) ? defaultFormat : (available[0] ?? "vinyl");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="discogsId" value={discogsId} />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t("format.legend")}</legend>
        <div className="flex flex-wrap gap-2">
          {available.map((format) => {
            const Icon = formatIcons[format];

            return (
              <label key={format} className={`${choiceChipClass} capitalize`}>
                <input
                  type="radio"
                  name="format"
                  value={format}
                  defaultChecked={format === selected}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(`format.${format}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t("explorer.shelf")}</legend>
        <div className="flex flex-wrap gap-2">
          <label className={choiceChipClass}>
            <input type="radio" name="kind" value="owned" defaultChecked className="sr-only" />
            <Library className="size-4 shrink-0" aria-hidden />
            {t("nav.collection")}
          </label>
          <label className={choiceChipClass}>
            <input type="radio" name="kind" value="wishlist" className="sr-only" />
            <BookmarkPlus className="size-4 shrink-0" aria-hidden />
            {t("explorer.wishlist")}
          </label>
        </div>
      </fieldset>

      <TextAreaField
        id="notes"
        name="notes"
        label={t("explorer.memoryOptional")}
        rows={4}
        placeholder={t("explorer.memoryPlaceholder")}
      />

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Button type="submit" disabled={isPending}>
        {isPending ? (
          t("explorer.adding")
        ) : (
          <>
            <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
            {t("explorer.addRecord")}
          </>
        )}
      </Button>
    </form>
  );
}
