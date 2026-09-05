"use client";

import { BookmarkPlus, FaceSlightlySmilingPlus, Library } from "lucide-react";
import { useActionState } from "react";

import { addManualReleaseAction, type AddReleaseState } from "@/app/explorer/actions";
import { ManualCoverField } from "@/app/explorer/manual/manual-cover-field";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { TextAreaField, TextField } from "@/components/ui/field";
import { formatIcons } from "@/components/ui/format-icon";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useJournalLeave } from "@/components/ui/use-journal-leave";
import { useT } from "@/components/locale-provider";
import { PRESSING_BARCODE_MAX, PRESSING_LABEL_MAX, PRESSING_NAME_MAX } from "@/lib/collection/manual";
import { MEDIA_FORMATS, type MediaFormat } from "@/lib/collection/types";

const initialState: AddReleaseState = { error: null, href: null };

interface ManualReleaseFormProps {
  defaultFormat: MediaFormat;
  formats: MediaFormat[];
}

export function ManualReleaseForm({ defaultFormat, formats }: ManualReleaseFormProps) {
  const t = useT();
  const [state, formAction, isPending] = useActionState(addManualReleaseAction, initialState);
  const isLeaving = useJournalLeave(state.href);
  const isBusy = isPending || isLeaving;
  const available = formats.length > 0 ? formats : [...MEDIA_FORMATS];
  const selected = available.includes(defaultFormat) ? defaultFormat : (available[0] ?? "vinyl");

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <TextField
        id="manual-artist"
        name="artist"
        label={t("explorer.writeArtist")}
        autoComplete="off"
        required
        maxLength={PRESSING_NAME_MAX}
        translate="no"
      />
      <TextField
        id="manual-title"
        name="title"
        label={t("explorer.writeAlbum")}
        autoComplete="off"
        required
        maxLength={PRESSING_NAME_MAX}
        translate="no"
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <TextField
          id="manual-year"
          name="year"
          type="number"
          inputMode="numeric"
          label={t("explorer.writeYear")}
          placeholder="1993"
          min={1880}
          max={2100}
        />
        <TextField
          id="manual-label"
          name="label"
          label={t("explorer.writeLabel")}
          autoComplete="off"
          maxLength={PRESSING_LABEL_MAX}
          translate="no"
        />
      </div>
      <TextField
        id="manual-barcode"
        name="barcode"
        label={t("explorer.writeBarcode")}
        inputMode="numeric"
        autoComplete="off"
        maxLength={PRESSING_BARCODE_MAX}
        translate="no"
      />

      <ManualCoverField />

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

      <Button type="submit" disabled={isBusy}>
        <BusyGlyph isBusy={isBusy}>
          <FaceSlightlySmilingPlus className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isBusy ? t("explorer.writing") : t("explorer.writeIn")}
      </Button>
    </form>
  );
}
