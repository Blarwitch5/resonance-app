"use client";

import { BookmarkPlus, FaceSlightlySmilingPlus, Library } from "lucide-react";
import { useActionState, useState, type FormEvent } from "react";

import { addReleaseAction, type AddReleaseState } from "@/app/explorer/actions";
import { Button } from "@/components/ui/button";
import { choiceChipClass } from "@/components/ui/chip";
import { fieldsetClass, legendClass } from "@/components/ui/control";
import { TextAreaField } from "@/components/ui/field";
import { formatIcons } from "@/components/ui/format-icon";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useJournalLeave } from "@/components/ui/use-journal-leave";
import { useT } from "@/components/locale-provider";
import { MEDIA_FORMATS, type CollectionKind, type MediaFormat } from "@/lib/collection/types";

const initialState: AddReleaseState = { error: null, href: null };

interface AddReleaseFormProps {
  discogsId: number;
  defaultFormat: MediaFormat;
  formats: MediaFormat[];
}

export function AddReleaseForm({ discogsId, defaultFormat, formats }: AddReleaseFormProps) {
  const t = useT();
  const [actionState, formAction, isActionPending] = useActionState(addReleaseAction, initialState);
  const [fetchState, setFetchState] = useState<AddReleaseState>(initialState);
  const [isFetching, setIsFetching] = useState(false);
  const state = fetchState.href || fetchState.error ? fetchState : actionState;
  const isLeaving = useJournalLeave(state.href);
  const isBusy = isActionPending || isFetching || isLeaving;
  const available = formats.length > 0 ? formats : [...MEDIA_FORMATS];
  const selected = available.includes(defaultFormat) ? defaultFormat : (available[0] ?? "vinyl");
  const [format, setFormat] = useState<MediaFormat>(selected);
  const [kind, setKind] = useState<CollectionKind>("owned");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (isBusy) {
      return;
    }

    setIsFetching(true);
    setFetchState(initialState);

    try {
      const notes = String(new FormData(event.currentTarget).get("notes") ?? "");
      const response = await fetch("/api/resonance/releases", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ discogsId, format, kind, notes }),
      });
      const payload = (await response.json()) as { href?: string; error?: string };

      if (!response.ok || !payload.href) {
        setFetchState({ error: payload.error ?? t("error.recordAdd"), href: null });
        return;
      }

      setFetchState({ error: null, href: payload.href });
    } catch {
      setFetchState({ error: t("error.recordAdd"), href: null });
    } finally {
      setIsFetching(false);
    }
  }

  return (
    <form action={formAction} onSubmit={(event) => void handleSubmit(event)} className="flex flex-col gap-5">
      <input type="hidden" name="discogsId" value={discogsId} />
      <input type="hidden" name="format" value={format} />
      <input type="hidden" name="kind" value={kind} />

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t("format.legend")}</legend>
        <div className="flex flex-wrap gap-2">
          {available.map((value) => {
            const Icon = formatIcons[value];

            return (
              <label key={value} className={`${choiceChipClass} capitalize`}>
                <input
                  type="radio"
                  name="formatChoice"
                  value={value}
                  checked={format === value}
                  onChange={() => {
                    setFormat(value);
                  }}
                  className="sr-only"
                />
                <Icon className="size-4 shrink-0" aria-hidden />
                {t(`format.${value}`)}
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className={fieldsetClass}>
        <legend className={legendClass}>{t("explorer.shelf")}</legend>
        <div className="flex flex-wrap gap-2">
          <label className={choiceChipClass}>
            <input
              type="radio"
              name="kindChoice"
              value="owned"
              checked={kind === "owned"}
              onChange={() => {
                setKind("owned");
              }}
              className="sr-only"
            />
            <Library className="size-4 shrink-0" aria-hidden />
            {t("nav.collection")}
          </label>
          <label className={choiceChipClass}>
            <input
              type="radio"
              name="kindChoice"
              value="wishlist"
              checked={kind === "wishlist"}
              onChange={() => {
                setKind("wishlist");
              }}
              className="sr-only"
            />
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
        {isBusy ? t("explorer.adding") : t("explorer.addRecord")}
      </Button>
    </form>
  );
}
