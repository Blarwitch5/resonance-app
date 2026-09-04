"use client";

import { FolderDown, UserRound } from "lucide-react";
import { useActionState } from "react";

import { importDiscogsAction, type ImportDiscogsState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { BusyGlyph } from "@/components/ui/listening-wave";
import { Notice } from "@/components/ui/notice";
import { useT } from "@/components/locale-provider";

const initialState: ImportDiscogsState = {
  error: null,
  added: null,
  skipped: null,
  truncated: false,
};

function importStory(state: ImportDiscogsState, t: (path: string, vars?: Record<string, string | number>) => string): string | null {
  if (state.added === null || state.skipped === null) {
    return null;
  }

  const addedLine =
    state.added === 0
      ? t("discogsImport.nothingNew")
      : state.added === 1
        ? t("discogsImport.addedOne")
        : t("discogsImport.addedMany", { count: state.added });
  const skippedLine =
    state.skipped === 0
      ? null
      : state.skipped === 1
        ? t("discogsImport.skippedOne")
        : t("discogsImport.skippedMany", { count: state.skipped });
  const truncatedLine = state.truncated ? t("discogsImport.truncated") : null;

  return [addedLine, skippedLine, truncatedLine].filter((line) => line !== null).join(" ");
}

export function ImportDiscogsForm() {
  const t = useT();
  const [state, formAction, isPending] = useActionState(importDiscogsAction, initialState);
  const story = importStory(state, t);

  return (
    <form action={formAction} aria-busy={isPending} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        {t("discogsImport.hint")}
      </p>
      <TextField
        id="discogs-username"
        name="username"
        label={t("discogsImport.username")}
        autoComplete="off"
        spellCheck={false}
        icon={UserRound}
        placeholder={t("discogsImport.usernamePlaceholder")}
      />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {story ? <Notice tone="success">{story}</Notice> : null}
      <Button type="submit" disabled={isPending}>
        <BusyGlyph isBusy={isPending}>
          <FolderDown className="size-4 shrink-0" aria-hidden />
        </BusyGlyph>
        {isPending ? t("discogsImport.listening") : t("discogsImport.bring")}
      </Button>
    </form>
  );
}
