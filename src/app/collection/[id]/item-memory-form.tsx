"use client";

import { Calendar, MapPin, Save } from "lucide-react";
import { useActionState } from "react";

import { updateItemAction, type UpdateItemState } from "@/app/collection/[id]/actions";
import { Button } from "@/components/ui/button";
import { SelectField, TextAreaField, TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";
import { CONDITION_LABELS, MEDIA_CONDITIONS, type MediaCondition } from "@/lib/collection/types";

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
  const [state, formAction, isPending] = useActionState(updateItemAction, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="id" value={id} />

      <TextField
        id="purchase-location"
        name="purchaseLocation"
        label="Where it found you"
        defaultValue={purchaseLocation ?? ""}
        placeholder="A shop, a friend, a city."
        maxLength={120}
        icon={MapPin}
      />

      <TextField
        id="purchase-date"
        name="purchaseDate"
        type="date"
        label="When it found you"
        defaultValue={purchaseDate ?? ""}
        icon={Calendar}
      />

      <SelectField id="condition" name="condition" label="Condition" defaultValue={condition ?? ""}>
        <option value="">Unknown</option>
        {MEDIA_CONDITIONS.map((value) => (
          <option key={value} value={value}>
            {CONDITION_LABELS[value]}
          </option>
        ))}
      </SelectField>

      <TextAreaField
        id="notes"
        name="notes"
        label="A memory"
        rows={5}
        defaultValue={notes ?? ""}
        maxLength={4000}
        placeholder="Let this music resonate with your memories."
      />

      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {state.saved ? <Notice tone="success">Saved to your journal.</Notice> : null}

      <Button type="submit" disabled={isPending}>
        <Save className="size-4 shrink-0" aria-hidden />
        {isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
