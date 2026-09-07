"use client";

import { Calendar, MapPin, Save } from "lucide-react";
import { useActionState, useId, type ReactNode } from "react";

import { updateItemAction, type UpdateItemState } from "@/app/collection/[id]/actions";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";
import { MEDIA_CONDITIONS, type MediaCondition } from "@/lib/collection/types";

const initialState: UpdateItemState = { error: null, saved: false };

interface ItemMemoryFormProps {
  id: string;
  notes: string | null;
  condition: MediaCondition | null;
  purchaseLocation: string | null;
  purchaseDate: string | null;
  actions?: ReactNode;
}

export function ItemMemoryForm({
  id,
  notes,
  condition,
  purchaseLocation,
  purchaseDate,
  actions = null,
}: ItemMemoryFormProps) {
  const t = useT();
  const formId = useId();
  const [state, formAction, isPending] = useActionState(updateItemAction, initialState);

  return (
    <div className="flex flex-col gap-5">
      <form id={formId} action={formAction} aria-busy={isPending} className="flex flex-col gap-5">
        <input type="hidden" name="id" value={id} />

        <TextField
          id="purchase-location"
          name="purchaseLocation"
          label={t("journal.whereFound")}
          defaultValue={purchaseLocation ?? ""}
          placeholder={t("journal.wherePlaceholder")}
          maxLength={120}
          icon={MapPin}
        />

        <TextField
          id="purchase-date"
          name="purchaseDate"
          type="date"
          label={t("journal.whenFound")}
          defaultValue={purchaseDate ?? ""}
          icon={Calendar}
        />

        <SelectField id="condition" name="condition" label={t("condition.legend")} defaultValue={condition ?? ""}>
          <option value="">{t("condition.unknown")}</option>
          {MEDIA_CONDITIONS.map((value) => (
            <option key={value} value={value}>
              {t(`condition.${value}`)}
            </option>
          ))}
        </SelectField>

        <TextAreaField
          id="notes"
          name="notes"
          label={t("journal.memory")}
          rows={5}
          defaultValue={notes ?? ""}
          maxLength={4000}
          placeholder={t("journal.memoryPlaceholder")}
        />

        {state.error ? <Notice tone="error">{state.error}</Notice> : null}
        {state.saved ? <Notice tone="success">{t("journal.saved")}</Notice> : null}
      </form>

      <div className="flex flex-wrap items-center gap-3 has-[[data-release-confirm]]:flex-col has-[[data-release-confirm]]:items-stretch has-[[data-release-confirm]]:[&>button[type=submit]]:hidden">
        {actions}
        <Button type="submit" form={formId} disabled={isPending} className="min-w-0 flex-1">
          <BusyGlyph isBusy={isPending}>
            <Save className="size-4 shrink-0" aria-hidden />
          </BusyGlyph>
          {isPending ? t("common.saving") : t("common.save")}
        </Button>
      </div>
    </div>
  );
}
