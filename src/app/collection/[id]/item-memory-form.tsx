"use client";

import { Calendar, MapPin, Save } from "lucide-react";
import { useActionState } from "react";

import { updateItemAction, type UpdateItemState } from "@/app/collection/[id]/actions";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
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
}

export function ItemMemoryForm({
  id,
  notes,
  condition,
  purchaseLocation,
  purchaseDate,
}: ItemMemoryFormProps) {
  const t = useT();
  const [state, formAction, isPending] = useActionState(updateItemAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
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

      <Button type="submit" disabled={isPending}>
        <Save className="size-4 shrink-0" aria-hidden />
        {isPending ? t("common.saving") : t("common.save")}
      </Button>
    </form>
  );
}
