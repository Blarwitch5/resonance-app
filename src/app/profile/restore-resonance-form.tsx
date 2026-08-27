"use client";

import { FolderUp } from "lucide-react";
import { useActionState } from "react";

import { restoreResonanceAction, type RestoreResonanceState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { controlClass, labelClass } from "@/components/ui/control";
import { Notice } from "@/components/ui/notice";

const initialState: RestoreResonanceState = {
  error: null,
  added: null,
  skipped: null,
};

function restoreStory(state: RestoreResonanceState): string | null {
  if (state.added === null || state.skipped === null) {
    return null;
  }

  const addedLine =
    state.added === 0 && state.skipped === 0
      ? "Your listening room found its way home."
      : state.added === 0
        ? "Nothing new found a home."
        : state.added === 1
          ? "1 record found a home."
          : `${state.added} records found a home.`;
  const skippedLine =
    state.skipped === 0
      ? null
      : state.skipped === 1
        ? "1 was already on your shelf."
        : `${state.skipped} were already on your shelf.`;

  return [addedLine, skippedLine].filter((line) => line !== null).join(" ");
}

export function RestoreResonanceForm() {
  const [state, formAction, isPending] = useActionState(restoreResonanceAction, initialState);
  const story = restoreStory(state);

  return (
    <form action={formAction} encType="multipart/form-data" className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        Bring a copy back. Records already on the shelf stay as they are.
      </p>
      <label htmlFor="resonance-backup" className={labelClass}>
        Resonance copy
        <input
          id="resonance-backup"
          name="backup"
          type="file"
          accept="application/json,.json"
          required
          className={controlClass}
        />
      </label>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {story ? <Notice tone="success">{story}</Notice> : null}
      <Button type="submit" disabled={isPending} variant="ghost">
        <FolderUp className="size-4 shrink-0" aria-hidden />
        {isPending ? "Listening to this copy…" : "Bring this copy home"}
      </Button>
    </form>
  );
}
