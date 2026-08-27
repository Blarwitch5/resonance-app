"use client";

import { FolderDown, UserRound } from "lucide-react";
import { useActionState } from "react";

import { importDiscogsAction, type ImportDiscogsState } from "@/app/profile/actions";
import { Button } from "@/components/ui/button";
import { TextField } from "@/components/ui/field";
import { Notice } from "@/components/ui/notice";

const initialState: ImportDiscogsState = {
  error: null,
  added: null,
  skipped: null,
  truncated: false,
};

function importStory(state: ImportDiscogsState): string | null {
  if (state.added === null || state.skipped === null) {
    return null;
  }

  const addedLine =
    state.added === 0
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
  const truncatedLine = state.truncated
    ? "We stopped at the first 200. You can bring the rest another time."
    : null;

  return [addedLine, skippedLine, truncatedLine].filter((line) => line !== null).join(" ");
}

export function ImportDiscogsForm() {
  const [state, formAction, isPending] = useActionState(importDiscogsAction, initialState);
  const story = importStory(state);

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <p className="text-sm leading-6 text-text-secondary">
        Bring records from a public Discogs collection and wishlist. Private shelves stay on Discogs.
      </p>
      <TextField
        id="discogs-username"
        name="username"
        label="Discogs username"
        autoComplete="off"
        spellCheck={false}
        icon={UserRound}
        placeholder="your-discogs-name"
      />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      {story ? <Notice tone="success">{story}</Notice> : null}
      <Button type="submit" disabled={isPending}>
        <FolderDown className="size-4 shrink-0" aria-hidden />
        {isPending ? "Listening to Discogs…" : "Bring this shelf"}
      </Button>
    </form>
  );
}
