"use client";

import { FolderUp } from "lucide-react";
import { useActionState } from "react";

import { restoreResonanceAction, type RestoreResonanceState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { controlClass, controlInsetClass, labelClass } from "@/components/ui/control";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";

const initialState: RestoreResonanceState = {
  error: null,
  added: null,
  skipped: null,
};

function restoreStory(state: RestoreResonanceState, t: (path: string, vars?: Record<string, string | number>) => string): string | null {
  if (state.added === null || state.skipped === null) {
    return null;
  }

  const addedLine =
    state.added === 0 && state.skipped === 0
      ? t("backup.homeQuiet")
      : state.added === 0
        ? t("backup.nothingNew")
        : state.added === 1
          ? t("backup.addedOne")
          : t("backup.addedMany", { count: state.added });
  const skippedLine =
    state.skipped === 0
      ? null
      : state.skipped === 1
        ? t("backup.skippedOne")
        : t("backup.skippedMany", { count: state.skipped });

  return [addedLine, skippedLine].filter((line) => line !== null).join(" ");
}

export function RestoreResonanceForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(restoreResonanceAction, initialState);
  const story = restoreStory(state, t);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("backup.restoreHint")}
      </p>
      <label htmlFor="resonance-backup" className={labelClass}>
        {t("backup.restoreFile")}
        <input
          id="resonance-backup"
          name="backup"
          type="file"
          accept="application/json,.json"
          required
          className={`${controlClass} ${controlInsetClass()}`}
        />
      </label>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {story ? <Notice tone="success">{story}</Notice> : null}
      <Button type="submit" disabled={isPending} variant="ghost">
        <BusyGlyph isBusy={isPending}>
          <FolderUp className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isPending ? t("backup.restoring") : t("backup.restore")}
      </Button>
    </form>
  );
}
